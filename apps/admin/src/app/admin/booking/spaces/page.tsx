import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { SpacesClient } from "./SpacesClient"

export default async function SpacesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role
  if (!["dev", "admin"].includes(userRole || "")) {
    redirect("/403")
  }

  return <SpacesClient />
}
