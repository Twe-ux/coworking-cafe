import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"
import { EmailPreviewClient } from "./EmailPreviewClient"

export default async function EmailPreviewPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role
  if (userRole !== "dev") {
    redirect("/403")
  }

  return <EmailPreviewClient />
}
