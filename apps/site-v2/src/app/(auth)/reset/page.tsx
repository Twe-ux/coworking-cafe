import type { Metadata } from "next"
import { ResetForm } from "./ResetForm"

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez votre mot de passe CoworKing Café.",
  robots: { index: false },
}

export default function ResetPage() {
  return <ResetForm />
}
