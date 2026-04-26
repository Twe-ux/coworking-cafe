import type { Metadata } from "next"
import { BookingFlow } from "@/components/booking/BookingFlow"
import { VENUES } from "@/types/venue"

export const metadata: Metadata = {
  title: "Réserver — CoworKing Café",
  description: "Réservez votre espace de coworking en quelques clics. Open space, salles de réunion, espace événementiel.",
}

export default function BookingPage() {
  return (
    <main style={{ minHeight: "100svh", background: "var(--cream)" }}>
      <BookingFlow venues={VENUES} />
    </main>
  )
}
