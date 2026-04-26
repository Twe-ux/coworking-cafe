import type { Metadata } from "next"
import { ResetForm } from "./ResetForm"

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false },
}

export default function ResetPage() {
  return <ResetForm />
}
