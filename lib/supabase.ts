import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type User = {
  id: string
  email: string
  full_name: string
  phone: string
  credits: number
  email_verified: boolean
  created_at: string
}

export type Payment = {
  id: string
  user_id: string
  package_id: string
  crypto_currency: string
  crypto_amount: number
  usd_amount: number
  credits: number
  wallet_address: string
  payment_address: string
  status: "pending" | "confirmed" | "expired" | "failed"
  expires_at: string
  created_at: string
}

export type SMSMessage = {
  id: string
  user_id: string
  sender_id: string
  recipients: string[]
  message: string
  country_code: string
  credits_used: number
  status: string
  created_at: string
}
