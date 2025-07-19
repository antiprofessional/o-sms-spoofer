"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth-actions"
import { createPayment } from "@/lib/payment-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Check,
  Star,
  Shield,
  Globe,
  Zap,
  BarChart3,
  Headphones,
  ArrowRight,
  Crown,
  Building2,
} from "lucide-react"
import { QRGenerator } from "@/components/qr-generator"
import { redirect } from "next/navigation"
import type { User, Payment } from "@/lib/supabase"

const pricingPlans = [
  {
    id: "professional",
    name: "Professional",
    description: "Perfect for growing businesses with higher volume",
    price: 149,
    credits: 10000,
    popular: true,
    features: [
      "10,000 SMS credits",
      "200+ countries coverage",
      "Advanced sender ID spoofing",
      "Priority support",
      "Advanced analytics & reporting",
      "API access with webhooks",
      "Delivery confirmations",
      "Bulk messaging tools",
    ],
  },
  {
    id: "business",
    name: "Business",
    description: "For established businesses with high volume needs",
    price: 299,
    credits: 25000,
    popular: false,
    features: [
      "25,000 SMS credits",
      "Global coverage (200+ countries)",
      "Premium sender ID management",
      "Priority support with SLA",
      "Advanced analytics suite",
      "Custom API integrations",
      "Delivery confirmations",
      "Bulk messaging tools",
      "Custom compliance features",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: 599,
    credits: 50000,
    popular: false,
    features: [
      "50,000 SMS credits",
      "Global coverage (200+ countries)",
      "Premium sender ID management",
      "24/7 dedicated support",
      "Enterprise analytics suite",
      "Custom API integrations",
      "SLA guarantees",
      "White-label options",
      "Custom compliance features",
      "Dedicated account manager",
    ],
  },
]

export default function OnboardingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState("professional")
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const userData = await getCurrentUser()
      if (!userData) {
        redirect("/login")
      } else if (!userData.email_verified) {
        redirect("/verify-email")
      } else {
        setUser(userData)
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleCreatePayment = async () => {
    if (!selectedPlan) return

    setPaymentLoading(true)
    const result = await createPayment(selectedPlan, selectedCrypto)

    if (result.success && result.payment) {
      setCurrentPayment(result.payment)
    }

    setPaymentLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (currentPayment) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">O'SMS</span>
              <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 text-xs">
                Business
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Payment</h1>
            <p className="text-muted-foreground">Secure cryptocurrency payment processing</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Details */}
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Payment Details</span>
                  <Badge className="bg-orange-600/20 text-orange-400">30 min remaining</Badge>
                </CardTitle>
                <CardDescription>
                  Send exactly {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <QRGenerator value={currentPayment.payment_address} size={200} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Payment Address</label>
                    <div className="mt-1 p-3 bg-input rounded-lg border border-border font-mono text-sm break-all text-foreground">
                      {currentPayment.payment_address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Amount</label>
                      <div className="mt-1 p-3 bg-input rounded-lg border border-border font-mono text-sm text-foreground">
                        {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">USD Value</label>
                      <div className="mt-1 p-3 bg-input rounded-lg border border-border font-mono text-sm text-foreground">
                        ${currentPayment.usd_amount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">⚠️ Important Payment Instructions</h4>
                  <ul className="text-destructive/80 text-sm space-y-1">
                    <li>
                      • Send EXACTLY {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
                    </li>
                    <li>• Payment expires in 30 minutes</li>
                    <li>• Credits added automatically after confirmation</li>
                    <li>• Do not send from exchange wallets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-card border-border shadow-2xl">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Your selected business plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">
                      {pricingPlans.find((p) => p.id === selectedPlan)?.name} Plan
                    </h3>
                    <Badge className="bg-blue-600/20 text-blue-400">Selected</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {pricingPlans.find((p) => p.id === selectedPlan)?.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SMS Credits:</span>
                      <span className="font-medium text-foreground">{currentPayment.credits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan Price:</span>
                      <span className="font-medium text-foreground">${currentPayment.usd_amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium text-foreground">{currentPayment.crypto_currency}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">✅ What happens next?</h4>
                  <ul className="text-green-400/80 text-sm space-y-1">
                    <li>• Payment confirmed automatically</li>
                    <li>• Credits added to your account</li>
                    <li>• Access to full platform features</li>
                    <li>• Welcome email with getting started guide</li>
                  </ul>
                </div>

                <Button onClick={() => setCurrentPayment(null)} variant="outline" className="w-full">
                  Cancel Payment
                </Button>
              </CardContent>
            </Card>
          </div>
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
            <div className="text-muted-foreground text-sm">Welcome, {user?.full_name}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to O'SMS Business!</h1>
          <p className="text-xl text-muted-foreground mb-2">Your account has been verified successfully.</p>
          <p className="text-muted-foreground">
            Choose your business plan to start sending professional SMS messages worldwide.
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Business Plan</h2>
            <p className="text-muted-foreground">Flexible pricing for businesses of all sizes</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-card border-border shadow-2xl cursor-pointer transition-all hover:scale-105 ${
                  selectedPlan === plan.id ? "ring-2 ring-blue-500" : ""
                } ${plan.popular ? "ring-2 ring-yellow-400" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-black font-semibold px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    {plan.id === "enterprise" ? (
                      <Crown className="h-8 w-8 text-purple-400" />
                    ) : plan.id === "professional" ? (
                      <Building2 className="h-8 w-8 text-blue-400" />
                    ) : (
                      <Zap className="h-8 w-8 text-green-400" />
                    )}
                  </div>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">{plan.description}</CardDescription>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.credits.toLocaleString()} SMS credits included
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-green-600/20 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-400" />
                        </div>
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Crypto Selection */}
          <Card className="bg-card border-border shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-center">Select Payment Method</CardTitle>
              <CardDescription className="text-center">
                Secure cryptocurrency payments processed instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <TabsList className="grid w-full grid-cols-6 bg-input">
                  {["BTC", "ETH", "USDT", "LTC", "XMR", "SOL"].map((crypto) => (
                    <TabsTrigger
                      key={crypto}
                      value={crypto}
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      {crypto}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={handleCreatePayment}
              disabled={paymentLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              {paymentLoading ? (
                "Processing..."
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-sm mt-4">
              Secure payment • 256-bit encryption • Instant activation
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-foreground font-semibold mb-2">Enterprise Security</h3>
            <p className="text-muted-foreground text-sm">SOC 2 Type II compliant with 256-bit encryption</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-foreground font-semibold mb-2">Global Reach</h3>
            <p className="text-muted-foreground text-sm">Deliver messages to 200+ countries worldwide</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="text-foreground font-semibold mb-2">99.9% Uptime</h3>
            <p className="text-muted-foreground text-sm">Guaranteed service level agreement</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-card/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-foreground font-semibold mb-2">24/7 Support</h3>
            <p className="text-muted-foreground text-sm">Dedicated business support team</p>
          </div>
        </div>
      </div>
    </div>
  )
}
