"use server"

import { supabase } from "./supabase"
import { getCurrentUser } from "./auth-actions"
import { revalidatePath } from "next/cache"

export async function sendSMS(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const senderId = formData.get("senderId") as string
  const recipients = formData.get("recipients") as string
  const message = formData.get("message") as string
  const countryCode = formData.get("countryCode") as string

  if (!senderId || !recipients || !message || !countryCode) {
    return { error: "All fields are required" }
  }

  const recipientList = recipients
    .split(",")
    .map((r) => r.trim())
    .filter((r) => r)
  const creditsNeeded = recipientList.length

  if (user.credits < creditsNeeded) {
    return { error: "Insufficient credits" }
  }

  // Deduct credits
  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: user.credits - creditsNeeded })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Failed to deduct credits" }
  }

  // Save SMS record
  const { error: smsError } = await supabase.from("sms_messages").insert([
    {
      user_id: user.id,
      sender_id: senderId,
      recipients: recipientList,
      message,
      country_code: countryCode,
      credits_used: creditsNeeded,
    },
  ])

  if (smsError) {
    return { error: "Failed to send SMS" }
  }

  revalidatePath("/dashboard")
  return { success: true, message: `SMS sent to ${creditsNeeded} recipient(s)` }
}
