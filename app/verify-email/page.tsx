"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { verifyEmail } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error")
        setMessage("Invalid verification link")
        return
      }

      const result = await verifyEmail(token)
      if (result.success) {
        setStatus("success")
        setMessage(result.message || "Email verified successfully!")
      } else {
        setStatus("error")
        setMessage(result.error || "Verification failed")
      }
    }

    verify()
  }, [token])

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

              <div className="flex justify-center mb-6">
                {status === "loading" && (
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-white animate-spin" />
                  </div>
                )}
                {status === "success" && (
                  <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                )}
                {status === "error" && (
                  <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>

              <CardTitle className="text-foreground text-xl">
                {status === "loading" && "Verifying Your Email..."}
                {status === "success" && "Email Verified Successfully!"}
                {status === "error" && "Verification Failed"}
              </CardTitle>

              <CardDescription className="text-muted-foreground">
                {status === "loading" && "Please wait while we verify your email address"}
                {status === "success" && "Your business account is now active and ready to use"}
                {status === "error" && "There was a problem verifying your email address"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div
                className={`p-4 rounded-lg border ${
                  status === "success"
                    ? "bg-green-600/10 border-green-600/20"
                    : status === "error"
                      ? "bg-destructive/10 border-destructive/20"
                      : "bg-blue-600/10 border-blue-600/20"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {status === "loading" && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
                  {status === "success" && <CheckCircle className="h-5 w-5 text-green-400" />}
                  {status === "error" && <AlertCircle className="h-5 w-5 text-destructive" />}
                  <p
                    className={`text-sm font-medium ${
                      status === "success"
                        ? "text-green-400"
                        : status === "error"
                          ? "text-destructive"
                          : "text-blue-400"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>

              {status === "success" && (
                <div className="space-y-4">
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-3">🎉 What's Next?</h4>
                    <ul className="text-blue-400/80 text-sm space-y-2">
                      <li>• Choose your business plan and pricing</li>
                      <li>• Complete secure payment setup</li>
                      <li>• Start sending professional SMS messages</li>
                      <li>• Access enterprise features and analytics</li>
                    </ul>
                  </div>

                  <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    <Link href="/onboarding">
                      Continue to Plan Selection
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-4">
                  <div className="bg-card/50 border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-3">What you can do:</h4>
                    <ul className="text-muted-foreground text-sm space-y-2">
                      <li>• Check if the verification link has expired (24 hours)</li>
                      <li>• Request a new verification email from the login page</li>
                      <li>• Contact our support team if the problem persists</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-accent bg-transparent"
                    >
                      <Link href="/login">Try Signing In Again</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                      <Link href="/signup">Create New Account</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
