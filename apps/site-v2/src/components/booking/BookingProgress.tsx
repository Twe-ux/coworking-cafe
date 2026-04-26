"use client"

import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/cn"
import type { BookingStep } from "@/types/booking"

interface BookingProgressProps {
  currentStep: BookingStep
  firstStep: BookingStep
  totalSteps: number
  onBack: () => void
  showBackButton: boolean
  onGoToStep?: (step: BookingStep) => void
}

const STEP_LABELS: Record<number, string> = {
  0: "Choix du lieu",
  1: "Espace",
  2: "Date & heure",
  3: "Options",
  4: "Confirmation",
}

// ─── Mobile header ────────────────────────────────────────────────────────────

function MobileHeader({ currentStep, firstStep, totalSteps, onBack, showBackButton }: BookingProgressProps) {
  const segments = Array.from({ length: totalSteps }, (_, i) => i)

  return (
    <div className="md:hidden sticky top-0 z-40" style={{ background: "var(--body)" }}>
      {/* Row: back + title */}
      <div className="flex items-center gap-3 px-4 py-4">
        {showBackButton ? (
          <button
            onClick={onBack}
            aria-label="Retour"
            className="flex-shrink-0 flex items-center justify-center rounded-full text-white"
            style={{
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <Icon name="chevLeft" size={20} />
          </button>
        ) : (
          <div style={{ width: 32, height: 32, flexShrink: 0 }} />
        )}

        <span
          className="flex-1 text-center text-white uppercase tracking-widest font-mono"
          style={{ fontSize: 11 }}
        >
          {STEP_LABELS[currentStep]}
        </span>

        {/* Spacer pour centrer le titre */}
        <div style={{ width: 32, height: 32, flexShrink: 0 }} />
      </div>

      {/* Segments */}
      <div className="flex gap-1 px-4 pb-1">
        {segments.map((i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: 3,
              background: i <= currentStep - firstStep ? "var(--main)" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({ currentStep, firstStep, onBack, showBackButton, onGoToStep }: BookingProgressProps) {
  // Si firstStep=0 on affiche 5 steps (0→4), sinon 4 steps (1→4)
  const steps = Array.from(
    { length: firstStep === 0 ? 5 : 4 },
    (_, i) => i + firstStep,
  )

  return (
    <div
      className="hidden md:flex flex-col"
      style={{
        width: 240,
        height: "100%",
        background: "var(--body)",
        padding: "32px 20px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="mb-10">
        <span className="font-serif" style={{ fontSize: 20, color: "var(--btn)" }}>
          CoworKing
        </span>
        <span className="font-sans block" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Café
        </span>
      </div>

      {/* Back button */}
      <div className="mb-6" style={{ minHeight: 32 }}>
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 transition-colors rounded-[8px] px-2 py-1.5 -mx-2"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent" }}
          >
            <Icon name="chevLeft" size={14} stroke="currentColor" />
            <span className="font-sans">Étape précédente</span>
          </button>
        )}
      </div>

      {/* Steps list */}
      <div className="flex flex-col">
        {steps.map((step, index) => {
          const isCompleted = step < currentStep
          const isActive = step === currentStep
          const isClickable = (isCompleted || isActive) && !!onGoToStep
          const stepNumber = step - firstStep + 1

          return (
            <div key={step}>
              <button
                type="button"
                onClick={() => isClickable && onGoToStep(step as BookingStep)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-3 w-full text-left rounded-[8px] px-2 py-1 -mx-2 transition-colors",
                  isClickable && !isActive && "hover:bg-white/8 cursor-pointer",
                  isActive && "cursor-default",
                  !isClickable && "cursor-default",
                )}
              >
                {/* Circle */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 28,
                    height: 28,
                    background: isCompleted
                      ? "var(--btn)"
                      : isActive
                        ? "var(--main)"
                        : "transparent",
                    border: isCompleted || isActive
                      ? "none"
                      : "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {isCompleted ? (
                    <Icon name="check" size={12} stroke="var(--body)" sw={2.5} />
                  ) : (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 11,
                        color: isActive ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className="font-sans"
                  style={{
                    fontSize: 13,
                    color: isActive ? "white" : isCompleted ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>

              {/* Connector line — not after last step */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 20,
                    marginLeft: 13,
                    background: "rgba(255,255,255,0.12)",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export function BookingProgress(props: BookingProgressProps) {
  return (
    <>
      <MobileHeader {...props} />
      <DesktopSidebar {...props} />
    </>
  )
}
