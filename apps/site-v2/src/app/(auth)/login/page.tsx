import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace membre CoworKing Café.",
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
