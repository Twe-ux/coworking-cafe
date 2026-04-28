"use client"

import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/cn"
import type { BookingStep } from "@/types/booking"

interface DesktopSidebarProps {
  currentStep: BookingStep
  firstStep: BookingStep
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

export function DesktopSidebar({ currentStep, firstStep, onBack, showBackButton, onGoToStep }: DesktopSidebarProps) {
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
      <div className="flex flex-col flex-1">
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

      {/* Tip box */}
      <div
        style={{
          marginTop: "auto",
          padding: 14,
          background: "rgba(242,211,129,0.1)",
          borderRadius: 14,
          border: "1px solid rgba(242,211,129,0.2)",
        }}
      >
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <Icon name="sparkle" size={14} stroke="var(--btn)" fill="var(--btn)" />
          <span
            className="font-mono uppercase"
            style={{ fontSize: 9, letterSpacing: "0.14em", color: "var(--btn)" }}
          >
            Astuce
          </span>
        </div>
        <p
          className="font-sans"
          style={{ fontSize: 11.5, lineHeight: 1.45, opacity: 0.85, color: "white", margin: 0 }}
        >
          Réservez à la semaine pour économiser 15&nbsp;%, ou au mois pour 40&nbsp;%.
        </p>
      </div>
    </div>
  )
}
