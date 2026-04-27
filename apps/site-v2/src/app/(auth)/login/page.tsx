import type { Metadata } from "next"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace membre CoworKing Café.",
  robots: { index: false },
}

export default function LoginPage() {
  return <LoginForm />
}
