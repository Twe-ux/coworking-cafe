import type { Metadata } from "next"
import { RegisterForm } from "./RegisterForm"

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Rejoignez 420+ membres CoworKing Café. 1h offerte sur votre première réservation.",
  robots: { index: false },
}

export default function RegisterPage() {
  return <RegisterForm />
}
