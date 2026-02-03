import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { AgendaClient } from "./AgendaClient"

export default async function CalendarAltPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role
  if (!["dev", "admin", "staff"].includes(userRole || "")) {
    redirect("/403")
  }

  return <AgendaClient />
}
