"use client"

import Link from "next/link"

import { AuthLogo, AuthBrandPanel, AuthDivider, SocialButton } from "@/components/auth"
import { Icon } from "@/components/ui/Icon"
import { useRegisterForm } from "./useRegisterForm"
import { Step1Form } from "./Step1Form"
import { Step2Form } from "./Step2Form"

type DotState = "done" | "active" | "pending"

function StepDots({ step }: { step: 1 | 2 }) {
  const states: [DotState, DotState, DotState] =
    step === 1 ? ["active", "pending", "pending"] : ["done", "active", "pending"]

  const colors: Record<DotState, string> = {
    done: "var(--btn)",
    active: "var(--main)",
    pending: "var(--line)",
  }

  return (
    <div className="flex gap-1.5">
      {states.map((state, i) => (
        <span key={i} style={{ width: 22, height: 4, borderRadius: 2, background: colors[state] }} />
      ))}
    </div>
  )
}

export function RegisterForm() {
  const {
    step, setStep, isLoading, submitError,
    cguChecked, toggleCgu,
    form1, form2, onStep1, onStep2,
  } = useRegisterForm()

  const formContent = step === 1 ? (
    <Step1Form form={form1} submitError={submitError} onSubmit={onStep1} />
  ) : (
    <Step2Form form={form2} submitError={submitError} isLoading={isLoading}
      cguChecked={cguChecked} onToggleCgu={toggleCgu} onSubmit={onStep2} onBack={() => setStep(1)} />
  )

  return (
    <div className="flex items-center justify-center min-h-screen p-6 md:p-8">
      <div className="w-full max-w-[1240px]">

        {/* Mobile */}
        <div className="md:hidden max-w-[400px] mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} aria-label="Retour"
                className="flex items-center justify-center"
                style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1px solid var(--line)" }}>
                <Icon name="chevLeft" size={16} stroke="var(--body)" />
              </button>
            ) : <AuthLogo />}
            <StepDots step={step} />
            <div style={{ width: 40 }} />
          </div>
          {formContent}
        </div>

        {/* Desktop */}
        <div className="hidden md:grid overflow-hidden"
          style={{ gridTemplateColumns: "1fr 1fr", borderRadius: 18, background: "#fff",
            boxShadow: "0 30px 60px rgba(20,34,32,0.14), 0 0 0 1px var(--line)" }}>
          <AuthBrandPanel mode="register" />

          <div className="flex flex-col overflow-y-auto bg-white" style={{ padding: "44px 60px" }}>
            <div className="flex justify-between items-center">
              <StepDots step={step} />
              <div className="text-sm" style={{ color: "var(--gry)" }}>
                Déjà inscrit ?{" "}
                <Link href="/login" className="font-medium"
                  style={{ color: "var(--main)", borderBottom: "1px solid var(--main)", paddingBottom: 2 }}>
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="flex flex-col my-auto max-w-[440px] w-full" style={{ paddingTop: 40, paddingBottom: 40 }}>
              {step === 1 && (
                <>
                  <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <SocialButton brand="apple" />
                    <SocialButton brand="google" />
                  </div>
                  <AuthDivider text="OU PAR EMAIL" />
                </>
              )}
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} aria-label="Retour"
                  className="flex items-center justify-center self-start mb-6"
                  style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", border: "1px solid var(--line)" }}>
                  <Icon name="chevLeft" size={16} stroke="var(--body)" />
                </button>
              )}
              {formContent}
            </div>

            <div className="flex items-center justify-center gap-1.5 font-mono"
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
