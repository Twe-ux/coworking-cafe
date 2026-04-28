"use client"

import Link from "next/link"
import { UseFormReturn } from "react-hook-form"

import { AuthField, SubmitButton } from "@/components/auth"
import { Icon } from "@/components/ui/Icon"

import type { Step2Values } from "./useRegisterForm"

interface Step2FormProps {
  form: UseFormReturn<Step2Values>
  submitError: string | null
  isLoading: boolean
  cguChecked: boolean
  onToggleCgu: () => void
  onSubmit: (data: Step2Values) => void
}

export function Step2Form({ form, submitError, isLoading, cguChecked, onToggleCgu, onSubmit }: Step2FormProps) {
  const { register, handleSubmit, formState: { errors } } = form

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div>
        <div className="eyebrow" style={{ color: "var(--main)", marginBottom: 6 }}>
          Étape 2 sur 2
        </div>
        <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em", color: "var(--body)", margin: 0 }}>
          Vos <em style={{ color: "var(--main)", fontStyle: "italic" }}>informations</em>
        </h1>
        {/* Step progress — below title */}
        <div className="flex gap-2 mt-4">
          <span style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--btn)" }} />
          <span style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--main)" }} />
        </div>
      </div>

      {submitError && (
        <div className="text-sm px-4 py-3 rounded-[12px]"
          style={{ background: "rgba(192,83,76,0.08)", color: "var(--danger)", border: "1px solid rgba(192,83,76,0.2)" }}>
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <AuthField fieldId="firstName" label="Prénom" type="text" placeholder="Claire"
            autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
          <AuthField fieldId="lastName" label="Nom" type="text" placeholder="Dupont"
            autoComplete="family-name" {...register("lastName")} />
        </div>

        {/* CGU checkbox — custom UI, value managed via setValue in hook */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <button type="button" role="checkbox" aria-checked={cguChecked} onClick={onToggleCgu}
              className="flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
              style={{ width: 20, height: 20, borderRadius: 6,
                background: cguChecked ? "var(--main)" : "var(--white)",
                border: cguChecked ? "none" : "1px solid var(--line)" }}>
              {cguChecked && <Icon name="check" size={12} stroke="white" sw={2.8} />}
            </button>
            <span className="text-xs leading-relaxed" style={{ color: "var(--body)" }}>
              J&apos;accepte les{" "}
              <Link href="/cgu" style={{ color: "var(--main)", textDecoration: "underline" }}>CGU</Link>{" "}
              et la{" "}
              <Link href="/confidentialite" style={{ color: "var(--main)", textDecoration: "underline" }}>
                politique de confidentialité
              </Link>
            </span>
          </label>
          {errors.cgu && (
            <p className="text-xs" style={{ color: "var(--danger)" }}>{errors.cgu.message}</p>
          )}
        </div>
      </div>

      {/* Incentive banner */}
      <div className="hidden md:flex items-center gap-2.5"
        style={{ background: "rgba(242,211,129,0.18)", borderRadius: 12, padding: "12px 14px" }}>
        <Icon name="gift" size={18} stroke="var(--btn-dark)" />
        <span className="text-sm" style={{ color: "var(--body)" }}>
          <strong>1h offerte</strong> sur votre première réservation
        </span>
      </div>

      <SubmitButton loading={isLoading}>Créer mon compte</SubmitButton>

      <div className="text-center text-sm" style={{ color: "var(--gry)" }}>
        Déjà inscrit ?{" "}
        <Link href="/login" style={{ color: "var(--main)", fontWeight: 500 }}>Se connecter</Link>
      </div>
    </form>
  )
}
