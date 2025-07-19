import { getCurrentUser } from "@/lib/auth-actions"
import { redirect } from "next/navigation"
import OSMSPlatform from "@/components/osms-platform"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <OSMSPlatform user={user} />
}
