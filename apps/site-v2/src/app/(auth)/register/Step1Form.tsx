"use client"

import Link from "next/link"
import { UseFormReturn } from "react-hook-form"
import { AuthField, PasswordStrength, SubmitButton } from "@/components/auth"
import type { Step1Values } from "./useRegisterForm"

interface Step1FormProps {
  form: UseFormReturn<Step1Values>
  submitError: string | null
  onSubmit: (data: Step1Values) => void
}

export function Step1Form({ form, submitError, onSubmit }: Step1FormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = form
  const watchedPassword = watch("password", "")

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--main)", marginBottom: 6 }}>
          Étape 1 sur 2
        </div>
        <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--body)", margin: 0 }}>
          Créez votre <em style={{ color: "var(--main)", fontStyle: "italic" }}>compte</em>
        </h1>
      </div>

      {submitError && (
        <div className="text-sm px-4 py-3 rounded-[12px]"
          style={{ background: "rgba(192,83,76,0.08)", color: "var(--danger)", border: "1px solid rgba(192,83,76,0.2)" }}>
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        <AuthField fieldId="email" label="Email" type="email" placeholder="claire@exemple.fr"
          iconName="mail" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <div>
          <AuthField fieldId="password" label="Mot de passe" type="password" placeholder="8 caractères minimum"
            iconName="lock" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <PasswordStrength password={watchedPassword} />
        </div>
      </div>

      <SubmitButton>Continuer</SubmitButton>

      <div className="text-center text-sm" style={{ color: "var(--gry)" }}>
        Déjà inscrit ?{" "}
        <Link href="/login" style={{ color: "var(--main)", fontWeight: 500 }}>Se connecter</Link>
      </div>
    </form>
  )
}
