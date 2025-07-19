import { getCurrentUser } from "@/lib/auth-actions"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
