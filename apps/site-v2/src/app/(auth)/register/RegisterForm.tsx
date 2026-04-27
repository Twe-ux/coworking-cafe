"use client"

import Link from "next/link"

import { AuthLogo, AuthBrandPanel, AuthDivider, SocialButton } from "@/components/auth"
import { Icon } from "@/components/ui/Icon"
import { useRegisterForm } from "./useRegisterForm"
import { Step1Form } from "./Step1Form"
import { Step2Form } from "./Step2Form"


export function RegisterForm() {
  const {
    step, setStep, isLoading, submitError,
    cguChecked, toggleCgu,
    form1, form2, onStep1, onStep2,
  } = useRegisterForm()

  // Single instance — avoids double ref registration on same form inputs
  const formContent = step === 1 ? (
    <Step1Form form={form1} submitError={submitError} onSubmit={onStep1} />
  ) : (
    <Step2Form form={form2} submitError={submitError} isLoading={isLoading}
      cguChecked={cguChecked} onToggleCgu={toggleCgu} onSubmit={onStep2} />
  )

  return (
    <div className="flex items-center justify-center min-h-full p-6 md:p-8">
      <div className="w-full max-w-[400px] md:max-w-[1240px]">

        {/*
          Single grid: 1 col on mobile (brand hidden), 2 cols on desktop.
          formContent is rendered ONCE in the form column — no double ref registration.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:overflow-hidden md:rounded-[18px] md:bg-white md:shadow-[0_30px_60px_rgba(20,34,32,0.14),0_0_0_1px_var(--line)]">

          {/* Brand panel — desktop left column only */}
          <div className="hidden md:block h-full">
            <AuthBrandPanel mode="register" />
          </div>

          {/* Form column — always rendered once */}
          <div className="flex flex-col md:overflow-y-auto md:bg-white md:px-[60px] md:py-[44px]">

            {/* Mobile top bar */}
            <div className="md:hidden mb-6">
              {step === 2 ? (
                <button type="button" onClick={() => setStep(1)} aria-label="Retour"
                  className="flex items-center justify-center"
                  style={{ width: 44, height: 44, borderRadius: 12, background: "var(--white)", border: "1px solid var(--line)" }}>
                  <Icon name="chevLeft" size={16} stroke="var(--body)" />
                </button>
              ) : <AuthLogo />}
            </div>

            {/* Desktop top bar */}
            <div className="hidden md:flex justify-end items-center mb-[40px]">
              <div className="text-sm" style={{ color: "var(--gry)" }}>
                Déjà inscrit ?{" "}
                <Link href="/login" className="font-medium"
                  style={{ color: "var(--main)", borderBottom: "1px solid var(--main)", paddingBottom: 2 }}>
                  Se connecter
                </Link>
              </div>
            </div>

            {/* Social buttons — desktop step 1 only */}
            {step === 1 && (
              <div className="hidden md:block mb-4">
                <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <SocialButton brand="apple" />
                  <SocialButton brand="google" />
                </div>
                <AuthDivider text="OU PAR EMAIL" />
              </div>
            )}

            {/* Desktop back button — step 2 */}
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} aria-label="Retour"
                className="hidden md:flex items-center justify-center self-start mb-6"
                style={{ width: 44, height: 44, borderRadius: 12, background: "var(--white)", border: "1px solid var(--line)" }}>
                <Icon name="chevLeft" size={16} stroke="var(--body)" />
              </button>
            )}

            {/* Form — single instance, works on both mobile and desktop */}
            {formContent}

            {/* Spacer on mobile to push footer away */}
            <div className="md:hidden mt-auto" />

            {/* Desktop footer */}
            <div className="hidden md:flex items-center justify-center gap-1.5 font-mono mt-auto pt-[40px]"
              style={{ fontSize: 11, letterSpacing: "0.08em", color: "var(--gry)", textTransform: "uppercase" }}>
              <Icon name="shield" size={10} stroke="var(--gry)" />
              PAIEMENT & DONNÉES SÉCURISÉS · RGPD
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
