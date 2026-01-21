import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { MessagesClient } from "./MessagesClient"

export default async function MessengerPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role
  if (!["dev", "admin", "staff"].includes(userRole || "")) {
    redirect("/403")
  }

  return <MessagesClient />
}
