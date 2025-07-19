"use server"

import { supabase } from "./supabase"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sendVerificationEmail, sendWelcomeEmail } from "./email"
import crypto from "crypto"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string

  if (!email || !password || !fullName || !phone) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  // Validate phone number (basic validation)
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/
  if (!phoneRegex.test(phone)) {
    return { error: "Please enter a valid phone number" }
  }

  // Check if user already exists
  const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

  if (existingUser) {
    return { error: "User already exists" }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex")
  const verificationExpires = new Date()
  verificationExpires.setHours(verificationExpires.getHours() + 24) // 24 hours

  // Create user
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
        email_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires.toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: "Failed to create user" }
  }

  // Send verification email
  const emailResult = await sendVerificationEmail(email, fullName, verificationToken)
  if (!emailResult.success) {
    return { error: "Account created but failed to send verification email" }
  }

  return {
    success: true,
    message: "Account created successfully! Please check your email to verify your account.",
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // Get user
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error || !user) {
    return { error: "Invalid credentials" }
  }

  // Check if email is verified
  if (!user.email_verified) {
    return { error: "Please verify your email address before signing in" }
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    return { error: "Invalid credentials" }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Redirect to onboarding if user has no credits (new user)
  if (user.credits === 0) {
    redirect("/onboarding")
  } else {
    redirect("/dashboard")
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("user_id")
  redirect("/login")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return null
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", userId).single()

  return user
}

export async function verifyEmail(token: string) {
  if (!token) {
    return { error: "Verification token is required" }
  }

  // Find user with this token
  const { data: user, error } = await supabase.from("users").select("*").eq("verification_token", token).single()

  if (error || !user) {
    return { error: "Invalid or expired verification token" }
  }

  // Check if token is expired
  const now = new Date()
  const expiresAt = new Date(user.verification_expires)
  if (now > expiresAt) {
    return { error: "Verification token has expired" }
  }

  // Update user as verified
  const { error: updateError } = await supabase
    .from("users")
    .update({
      email_verified: true,
      verification_token: null,
      verification_expires: null,
    })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Failed to verify email" }
  }

  // Send welcome email
  await sendWelcomeEmail(user.email, user.full_name)

  return { success: true, message: "Email verified successfully!" }
}

export async function resendVerificationEmail(email: string) {
  // Get user
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error || !user) {
    return { error: "User not found" }
  }

  if (user.email_verified) {
    return { error: "Email is already verified" }
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex")
  const verificationExpires = new Date()
  verificationExpires.setHours(verificationExpires.getHours() + 24)

  // Update user with new token
  const { error: updateError } = await supabase
    .from("users")
    .update({
      verification_token: verificationToken,
      verification_expires: verificationExpires.toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Failed to generate new verification token" }
  }

  // Send verification email
  const emailResult = await sendVerificationEmail(user.email, user.full_name, verificationToken)
  if (!emailResult.success) {
    return { error: "Failed to send verification email" }
  }

  return { success: true, message: "Verification email sent successfully!" }
}
