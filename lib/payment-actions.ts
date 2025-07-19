"use server"

import { supabase } from "./supabase"
import { getCurrentUser } from "./auth-actions"

// Mock crypto prices - in production, fetch from real API
const CRYPTO_PRICES = {
  BTC: 45000,
  ETH: 2800,
  USDT: 1,
  LTC: 75,
  XMR: 160,
  SOL: 65,
}

export async function createPayment(packageId: string, cryptoCurrency: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const packages = {
    professional: { credits: 10000, price: 149.0 },
    business: { credits: 25000, price: 299.0 },
    enterprise: { credits: 50000, price: 599.0 },
  }

  const selectedPackage = packages[packageId as keyof typeof packages]
  if (!selectedPackage) {
    return { error: "Invalid package" }
  }

  const cryptoPrice = CRYPTO_PRICES[cryptoCurrency as keyof typeof CRYPTO_PRICES]
  const cryptoAmount = selectedPackage.price / cryptoPrice

  // Generate payment address (in production, use actual crypto wallet generation)
  const paymentAddress = generatePaymentAddress(cryptoCurrency)

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 30) // 30 minutes to pay

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        user_id: user.id,
        package_id: packageId,
        crypto_currency: cryptoCurrency,
        crypto_amount: cryptoAmount,
        usd_amount: selectedPackage.price,
        credits: selectedPackage.credits,
        wallet_address: getWalletAddress(cryptoCurrency),
        payment_address: paymentAddress,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: "Failed to create payment" }
  }

  return { success: true, payment: data }
}

export async function checkPaymentStatus(paymentId: string) {
  const { data: payment } = await supabase.from("payments").select("*").eq("id", paymentId).single()

  if (!payment) {
    return { error: "Payment not found" }
  }

  // In production, check blockchain for actual payment
  // For demo, we'll simulate random confirmation
  if (payment.status === "pending" && Math.random() > 0.7) {
    // Simulate payment confirmation
    await supabase.from("payments").update({ status: "confirmed" }).eq("id", paymentId)

    // Add credits to user
    await supabase
      .from("users")
      .update({ credits: supabase.raw(`credits + ${payment.credits}`) })
      .eq("id", payment.user_id)

    return { success: true, status: "confirmed" }
  }

  return { success: true, status: payment.status }
}

function generatePaymentAddress(crypto: string): string {
  // In production, generate actual crypto addresses
  const addresses = {
    BTC: "bc1q" + Math.random().toString(36).substring(2, 15),
    ETH: "0x" + Math.random().toString(36).substring(2, 15),
    USDT: "T" + Math.random().toString(36).substring(2, 15),
    LTC: "L" + Math.random().toString(36).substring(2, 15),
    XMR: "4" + Math.random().toString(36).substring(2, 15),
    SOL: Math.random().toString(36).substring(2, 15),
  }
  return addresses[crypto as keyof typeof addresses] || ""
}

function getWalletAddress(crypto: string): string {
  const addresses = {
    BTC: "bc1q4h77y69kwdcr558w7ejzyntmjr9xy5wsqp9sys",
    ETH: "0x1f2a5b807058c171aa28a19b21ee77a1ab93da06",
    USDT: "TUZKzK18cp2J1gxK9zNrEBkARBntgcZFEz",
    LTC: "LU2KwsLukY2onmTRwtbTfLQserH6StS496",
    XMR: "89ByM65SQ36GuSeoPBd1wc3JYypiyoKPb2LHqyktc9gc7z8SPGuRTukAHGGCLzp2QUjPYvjt8Wxa9QVQrTku9BtYGEnrY64",
    SOL: "B2fBMqSxTRRYpNHVHCKB5vi5iA7y6wXAEs3UkBrvi3Pf",
  }
  return addresses[crypto as keyof typeof addresses] || ""
}
