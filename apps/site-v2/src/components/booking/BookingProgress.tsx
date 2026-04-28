"use client"

import { Icon } from "@/components/ui/Icon"
import type { BookingStep } from "@/types/booking"
import { DesktopSidebar } from "./BookingProgressDesktop"

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

// ─── Public component ─────────────────────────────────────────────────────────

export function BookingProgress(props: BookingProgressProps) {
  return (
    <>
      <MobileHeader {...props} />
      <DesktopSidebar {...props} />
    </>
  )
}
