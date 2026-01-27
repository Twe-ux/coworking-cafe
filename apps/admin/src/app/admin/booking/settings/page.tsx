import { requireAuth } from "@/lib/api/auth"
import { redirect } from "next/navigation"
import { BookingSettingsClient } from "./BookingSettingsClient"

export default async function BookingSettingsPage() {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    redirect("/login")
  }

  return <BookingSettingsClient />
}
