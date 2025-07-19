"use client"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  Send,
  Inbox,
  UserX,
  CreditCard,
  Settings,
  LayoutDashboard,
  Globe,
  Copy,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { QRGenerator } from "./qr-generator"
import { sendSMS } from "@/lib/sms-actions"
import { createPayment, checkPaymentStatus } from "@/lib/payment-actions"
import { signOut } from "@/lib/auth-actions"
import type { User, Payment } from "@/lib/supabase"

const countries = [
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+91", name: "India", flag: "🇮🇳" },
]

const pricingPackages = [
  { id: "professional", credits: 10000, price: 149.0, popular: true },
  { id: "business", credits: 25000, price: 299.0, popular: false },
  { id: "enterprise", credits: 50000, price: 599.0, popular: false },
]

interface OSMSPlatformProps {
  user: User
}

export default function OSMSPlatform({ user: initialUser }: OSMSPlatformProps) {
  const [activeView, setActiveView] = useState("send-sms") // Start with SMS form
  const [user, setUser] = useState(initialUser)
  const [phoneNumbers, setPhoneNumbers] = useState([""])
  const [selectedCountry, setSelectedCountry] = useState("+1")
  const [spoofedSender, setSpoofedSender] = useState("")
  const [message, setMessage] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)
  const [paymentTimer, setPaymentTimer] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [smsResult, setSmsResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null)

  const menuItems = [
    { id: "send-sms", label: "Send SMS", icon: Send },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "spoof-sender", label: "Spoof Sender ID", icon: UserX },
    { id: "crypto-payments", label: "Buy Credits", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Timer for payment expiration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentPayment && paymentTimer > 0) {
      interval = setInterval(() => {
        setPaymentTimer((prev) => {
          if (prev <= 1) {
            setCurrentPayment(null)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentPayment, paymentTimer])

  // Check payment status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentPayment && currentPayment.status === "pending") {
      interval = setInterval(async () => {
        const result = await checkPaymentStatus(currentPayment.id)
        if (result.success && result.status === "confirmed") {
          setUser((prev) => ({ ...prev, credits: prev.credits + currentPayment.credits }))
          setCurrentPayment(null)
          setPaymentTimer(0)
        }
      }, 5000) // Check every 5 seconds
    }
    return () => clearInterval(interval)
  }, [currentPayment])

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""])
  }

  const removePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    const updated = [...phoneNumbers]
    updated[index] = value
    setPhoneNumbers(updated)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendSMS = async (formData: FormData) => {
    setLoading(true)
    setSmsResult(null)

    const result = await sendSMS(formData)
    setSmsResult(result)

    if (result.success) {
      // Update user credits locally
      const recipientCount = phoneNumbers.filter((num) => num.trim()).length
      setUser((prev) => ({ ...prev, credits: prev.credits - recipientCount }))

      // Reset form
      setPhoneNumbers([""])
      setSpoofedSender("")
      setMessage("")
    }

    setLoading(false)
  }

  const handleCreatePayment = async () => {
    if (!selectedPackage) return

    setLoading(true)
    const result = await createPayment(selectedPackage, selectedCrypto)

    if (result.success && result.payment) {
      setCurrentPayment(result.payment)
      setPaymentTimer(30 * 60) // 30 minutes
    }

    setLoading(false)
  }

  const renderSendSMS = () => {
    const totalRecipients = phoneNumbers.filter((num) => num.trim() !== "").length
    const hasEnoughCredits = user.credits >= totalRecipients

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Send SMS</h2>
          <p className="text-gray-400">Send messages globally with custom sender IDs</p>
        </div>

        {user.credits === 0 && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-red-300 font-medium">No SMS Credits Available</p>
                  <p className="text-red-400 text-sm">You need to purchase credits before sending messages</p>
                </div>
                <Button
                  onClick={() => setActiveView("crypto-payments")}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Buy Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Compose Message</CardTitle>
              <div className="text-right">
                <p className="text-sm text-gray-400">Available Credits</p>
                <p className="text-lg font-bold text-white">{user.credits.toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form action={handleSendSMS} className="space-y-4">
              {smsResult && (
                <div
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    smsResult.success
                      ? "bg-green-900/20 border border-green-800"
                      : "bg-red-900/20 border border-red-800"
                  }`}
                >
                  {smsResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <p className={`text-sm ${smsResult.success ? "text-green-300" : "text-red-300"}`}>
                    {smsResult.message || smsResult.error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="countryCode" className="text-white">
                    Country Code
                  </Label>
                  <Select name="countryCode" value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code} className="text-white">
                          {country.flag} {country.code} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderId" className="text-white">
                    Sender ID
                  </Label>
                  <Input
                    name="senderId"
                    placeholder="e.g., BANK-ALERT, DELIVERY"
                    value={spoofedSender}
                    onChange={(e) => setSpoofedSender(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                    disabled={user.credits === 0}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Phone Numbers (comma separated)</Label>
                  <Button
                    type="button"
                    onClick={addPhoneNumber}
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    disabled={user.credits === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Number
                  </Button>
                </div>
                {phoneNumbers.map((number, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`${selectedCountry}1234567890`}
                      value={number}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                      disabled={user.credits === 0}
                    />
                    {phoneNumbers.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        size="sm"
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-900"
                        disabled={user.credits === 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <input type="hidden" name="recipients" value={phoneNumbers.filter((num) => num.trim()).join(",")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
                  Message
                </Label>
                <Textarea
                  name="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 min-h-[120px]"
                  disabled={user.credits === 0}
                  required
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{message.length}/160 characters</span>
                  <span className="text-gray-400">
                    Cost: {totalRecipients} credit{totalRecipients !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {!hasEnoughCredits && totalRecipients > 0 && user.credits > 0 && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    Insufficient credits. You need {totalRecipients} credits but only have {user.credits}.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={user.credits === 0 || !hasEnoughCredits || totalRecipients === 0 || loading}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading
                  ? "Sending..."
                  : user.credits === 0
                    ? "Purchase Credits to Send"
                    : !hasEnoughCredits
                      ? "Insufficient Credits"
                      : "Send SMS"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCryptoPayments = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Buy SMS Credits</h2>
        <p className="text-gray-400">Choose a package and pay with cryptocurrency</p>
      </div>

      {!currentPayment && (
        <>
          {/* Pricing Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {pricingPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`bg-gray-900 border-gray-800 cursor-pointer transition-all hover:border-blue-500 ${
                  selectedPackage === pkg.id ? "border-blue-500 bg-blue-900/20" : ""
                } ${pkg.popular ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader className="text-center pb-2">
                  {pkg.popular && <Badge className="w-fit mx-auto mb-2 bg-blue-600 text-white">Most Popular</Badge>}
                  <CardTitle className="text-white text-2xl">${pkg.price}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {pkg.credits.toLocaleString()} SMS Credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-400 mb-4">
                    ${((pkg.price / pkg.credits) * 1000).toFixed(2)} per 1,000 SMS
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Select Cryptocurrency</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <TabsList className="grid w-full grid-cols-6 bg-gray-800">
                      {["BTC", "ETH", "USDT", "LTC", "XMR", "SOL"].map((crypto) => (
                        <TabsTrigger key={crypto} value={crypto} className="text-white data-[state=active]:bg-blue-600">
                          {crypto}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Package:</span>
                      <span className="text-white">
                        {pricingPackages.find((p) => p.id === selectedPackage)?.credits.toLocaleString()} Credits
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price (USD):</span>
                      <span className="text-white font-bold">
                        ${pricingPackages.find((p) => p.id === selectedPackage)?.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Method:</span>
                      <span className="text-white">{selectedCrypto}</span>
                    </div>
                    <Button
                      onClick={handleCreatePayment}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Creating Payment..." : "Proceed to Payment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {currentPayment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Payment Details</CardTitle>
                <div className="flex items-center space-x-2 text-orange-400">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono">{formatTime(paymentTimer)}</span>
                </div>
              </div>
              <CardDescription className="text-gray-400">
                Send exactly {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <QRGenerator value={currentPayment.payment_address} size={200} />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Payment Address</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentPayment.payment_address}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(currentPayment.payment_address)}
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-300 text-sm font-medium">⚠️ Important:</p>
                <ul className="text-red-200 text-sm mt-1 space-y-1">
                  <li>
                    • Send EXACTLY {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
                  </li>
                  <li>• Payment expires in {formatTime(paymentTimer)}</li>
                  <li>• Credits will be added automatically after confirmation</li>
                  <li>• Do not send from an exchange wallet</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Waiting for Payment</p>
                  <p className="text-gray-400 text-sm">Monitoring blockchain for transaction</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">
                    {currentPayment.crypto_amount.toFixed(8)} {currentPayment.crypto_currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">USD Value:</span>
                  <span className="text-white">${currentPayment.usd_amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Credits:</span>
                  <span className="text-white">{currentPayment.credits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant="secondary" className="bg-yellow-900 text-yellow-300">
                    {currentPayment.status}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => setCurrentPayment(null)}
                variant="outline"
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case "send-sms":
        return renderSendSMS()
      case "crypto-payments":
        return renderCryptoPayments()
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-gray-400">Welcome back, {user.email}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">SMS Credits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{user.credits.toLocaleString()}</div>
                  <p className="text-xs text-blue-400">Available to send</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      default:
        return renderSendSMS()
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <SidebarProvider>
        <Sidebar className="border-gray-800">
          <SidebarHeader className="border-b border-gray-800 p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white tracking-tight">O`SMS</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveView(item.id)}
                        isActive={activeView === item.id}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Credits</span>
              <span className="text-sm font-bold text-white">{user.credits.toLocaleString()}</span>
            </div>
            <Button
              onClick={() => signOut()}
              variant="outline"
              size="sm"
              className="w-full border-gray-700 text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 px-4">
            <SidebarTrigger className="text-white hover:bg-gray-800" />
            <div className="flex items-center space-x-2 ml-auto">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Global SMS Platform</span>
            </div>
          </header>
          <main className="flex-1 p-6">{renderContent()}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
