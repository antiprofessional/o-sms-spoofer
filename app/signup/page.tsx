"use client"

import { useState } from "react"
import { signUp } from "@/lib/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, AlertCircle, CheckCircle, Mail, Shield, Globe, Star } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.message || "Account created successfully!")
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-white" />
              </div>

              <CardTitle className="text-foreground text-xl">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent a verification link to your email address
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-green-400 font-medium text-sm">Account Created Successfully</p>
                    <p className="text-green-400/80 text-sm">{success}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-3">Next Steps:</h4>
                <ol className="text-blue-400/80 text-sm space-y-2 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Choose your business plan and complete setup</li>
                  <li>Start sending professional SMS messages</li>
                </ol>
              </div>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-4">Didn't receive the email?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-accent bg-transparent"
                  onClick={() => window.location.reload()}
                >
                  Resend Verification Email
                </Button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Marketing */}
          <div className="text-foreground space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                Professional SMS Platform for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {" "}
                  Business
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join 10,000+ businesses using O'SMS for reliable, secure, and scalable SMS communications worldwide.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
                <div className="text-muted-foreground text-sm">Uptime SLA</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-green-400 mb-1">200+</div>
                <div className="text-muted-foreground text-sm">Countries</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                <div className="text-muted-foreground text-sm">Support</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
                <div className="text-2xl font-bold text-yellow-400 mb-1">10K+</div>
                <div className="text-muted-foreground text-sm">Businesses</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-muted-foreground">SOC 2 Type II Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-muted-foreground">256-bit End-to-End Encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-muted-foreground">GDPR & CCPA Compliant</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-background"
                  ></div>
                ))}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">Trusted by industry leaders</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-foreground text-2xl">Create Business Account</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Start your professional SMS journey today
                </CardDescription>
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

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">
                      Business Phone *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">
                      Business Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-4 w-4 text-blue-400 mt-0.5" />
                      <div className="text-blue-400">
                        <p className="font-medium mb-1">Enterprise Security</p>
                        <ul className="space-y-1 text-xs text-blue-400/80">
                          <li>• SOC 2 Type II compliance</li>
                          <li>• 256-bit encryption</li>
                          <li>• GDPR & CCPA compliant</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Business Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
