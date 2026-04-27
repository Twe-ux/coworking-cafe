"use client"

import { useState } from "react"

import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { AuthLogo, AuthField, SubmitButton } from "@/components/auth"
import { Icon } from "@/components/ui/Icon"

const schema = z.object({
  email: z.string().email("Email invalide"),
})

type FormValues = z.infer<typeof schema>

type FormState = "idle" | "loading" | "success"

export function ResetForm() {
  const [formState, setFormState] = useState<FormState>("idle")
  const [submittedEmail, setSubmittedEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormValues) {
    setSubmittedEmail(data.email)
    setFormState("loading")
    // Simulate API call — will be wired in Phase 5
    await new Promise<void>((resolve) => setTimeout(resolve, 1200))
    setFormState("success")
  }

  if (formState === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen px-8 pt-8 pb-6">
        <div
          className="flex flex-col items-center text-center max-w-[380px] w-full"
          style={{ gap: 24 }}
        >
          <AuthLogo />

          {/* Success icon */}
          <div
            className="flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(65,121,114,0.1)",
            }}
          >
            <Icon name="mail" size={28} stroke="var(--main)" />
          </div>

          <div>
            <h1
              className="font-serif"
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "var(--body)",
                margin: "0 0 8px",
                letterSpacing: "-0.015em",
              }}
            >
              Vérifiez vos emails
            </h1>
            <p
              className="font-sans"
              style={{
                fontSize: 14,
                color: "var(--gry)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Un lien de réinitialisation a été envoyé à{" "}
              <strong style={{ color: "var(--body)" }}>
                {submittedEmail}
              </strong>
              . Pensez à vérifier vos spams.
            </p>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full font-sans font-medium"
            style={{
              background: "var(--body)",
              color: "var(--btn)",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <Icon name="chevLeft" size={14} stroke="var(--btn)" sw={2.2} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-8 pt-8 pb-6">
      <div className="flex flex-col max-w-[380px] w-full" style={{ gap: 40 }}>
        <AuthLogo />

        <div>
          <div
            className="eyebrow"
            style={{
              color: "var(--main)",
              marginBottom: 8,
            }}
          >
            — Réinitialisation
          </div>
          <h1
            className="font-serif"
            style={{
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "var(--body)",
              margin: "0 0 10px",
            }}
          >
            Mot de passe oublié ?
          </h1>
          <p
            className="font-sans"
            style={{
              fontSize: 14,
              color: "var(--gry)",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Entrez votre email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <AuthField
            fieldId="email"
            label="Email"
            type="email"
            placeholder="claire@exemple.fr"
            iconName="mail"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <SubmitButton loading={formState === "loading"}>Envoyer le lien</SubmitButton>
        </form>

        <div className="text-center text-sm" style={{ color: "var(--gry)" }}>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 font-medium"
            style={{ color: "var(--main)", textDecoration: "none" }}
          >
            <Icon name="chevLeft" size={12} stroke="var(--main)" sw={2} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
