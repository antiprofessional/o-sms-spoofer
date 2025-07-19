"use client"

import { useState } from "react"
import { signIn, resendVerificationEmail } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, AlertCircle, Mail, Shield, Globe, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResendEmail, setShowResendEmail] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [email, setEmail] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setShowResendEmail(false)

    const emailValue = formData.get("email") as string
    setEmail(emailValue)

    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      if (result.error.includes("verify your email")) {
        setShowResendEmail(true)
      }
    }

    setLoading(false)
  }

  async function handleResendEmail() {
    if (!email) return

    setResendLoading(true)
    setResendMessage("")

    const result = await resendVerificationEmail(email)
    if (result.success) {
      setResendMessage("Verification email sent! Check your inbox.")
    } else {
      setResendMessage(result.error || "Failed to send email")
    }

    setResendLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">O'SMS</span>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
                Business
              </Badge>
            </div>
            <div className="flex items-center space-x-6 text-muted-foreground text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>200+ Countries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          <Card className="bg-card border-border shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground tracking-tight">O'SMS</span>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
                  Business
                </Badge>
              </div>
              <CardTitle className="text-foreground text-xl">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">Sign in to your business SMS platform</CardDescription>
            </CardHeader>

            <CardContent>
              <form action={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {showResendEmail && (
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <p className="text-blue-400 font-medium text-sm">Email Verification Required</p>
                    </div>
                    <p className="text-blue-400/80 text-sm mb-3">
                      Please verify your email address to access your account. We can send you a new verification email.
                    </p>
                    {resendMessage && (
                      <div
                        className={`text-sm mb-3 ${resendMessage.includes("sent") ? "text-green-400" : "text-destructive"}`}
                      >
                        {resendMessage}
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendLoading}
                      size="sm"
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      {resendLoading ? "Sending..." : "Resend Verification Email"}
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In to Business Account"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                    Create business account
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>SOC 2 Compliant</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
