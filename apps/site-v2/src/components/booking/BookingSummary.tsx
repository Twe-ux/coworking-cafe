"use client"

import { Icon } from "@/components/ui/Icon"
import type { BookingState, BookingService, BookingStep, PriceBreakdown, Space } from "@/types/booking"
import { TYPE_LABELS } from "@/types/booking"

interface BookingSummaryProps {
  state: BookingState
  pricing: PriceBreakdown
  spaces: Space[]
  services: BookingService[]
  canProceed: boolean
  currentStep: BookingStep
  onNext: () => void
  onConfirm: () => void
  /** At step 4, payment is embedded in StripePaymentForm — hide the CTA button */
  paymentEmbedded?: boolean
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between" style={{ paddingBlock: 10, borderBottom: "1px solid var(--line)" }}>
      <span className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--gry)" }}>{label}</span>
      <span className="font-sans text-right" style={{ fontSize: 14, color: value ? "var(--body)" : "var(--line)", maxWidth: "55%" }}>
        {value ?? "—"}
      </span>
    </div>
  )
}

// ─── BookingSummary ───────────────────────────────────────────────────────────

export function BookingSummary({
  state,
  pricing,
  spaces,
  services,
  canProceed,
  currentStep,
  onNext,
  onConfirm,
  paymentEmbedded = false,
}: BookingSummaryProps) {
  const space = spaces.find((s) => s.id === state.spaceId)
  const selectedServices = services.filter((s) => state.services.includes(s.id))
  const typeInfo = state.bookingType ? TYPE_LABELS[state.bookingType] : null
  const discountLabel = pricing.discount > 0 ? `-${Math.round(pricing.discount * 100)}%` : null
  const isConfirmStep = currentStep === 4

  return (
    <aside
      className="hidden md:flex flex-col sticky top-0 overflow-y-auto"
      style={{
        width: 380,
        height: "100svh",
        background: "white",
        borderLeft: "1px solid var(--line)",
        padding: "32px 28px",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <h2 className="font-serif" style={{ fontSize: 24, color: "var(--body)", marginBottom: 24 }}>
        Récapitulatif
      </h2>

      {/* Selection rows */}
      <div className="flex flex-col">
        <SummaryRow label="Espace" value={space?.name ?? null} />
        <SummaryRow label="Type" value={typeInfo?.label ?? null} />
        <SummaryRow label="Date" value={state.date} />
        {state.bookingType === "hourly" && (
          <SummaryRow label="Heure" value={state.startTime} />
        )}
        <SummaryRow
          label="Personnes"
          value={state.people > 0 ? `${state.people} personne${state.people > 1 ? "s" : ""}` : null}
        />
        <SummaryRow
          label="Services"
          value={
            selectedServices.length > 0
              ? selectedServices.map((s) => s.label).join(", ")
              : null
          }
        />
      </div>

      {/* Breakdown — visible si un espace est sélectionné */}
      {space && (
        <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16, marginTop: 16 }}>
          {/* Base */}
          <div className="flex justify-between items-center" style={{ paddingBlock: 4 }}>
            <span className="font-sans" style={{ fontSize: 12, color: "var(--gry)" }}>
              {space.name} · {pricing.hours}h
            </span>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--body)" }}>
              {pricing.base.toFixed(2)}€
            </span>
          </div>

          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between items-center" style={{ paddingBlock: 4 }}>
              <span className="font-sans" style={{ fontSize: 12, color: "var(--gry)" }}>{service.label}</span>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--body)" }}>+{service.price.toFixed(2)}€</span>
            </div>
          ))}

          {discountLabel && (
            <div className="flex justify-between items-center" style={{ paddingBlock: 4 }}>
              <span className="flex items-center gap-1.5 font-sans" style={{ fontSize: 12, color: "var(--gry)" }}>
                Remise
                <span className="font-mono" style={{ fontSize: 10, color: "var(--main)", background: "rgba(65,121,114,0.15)", borderRadius: 999, paddingInline: 6, paddingBlock: 2 }}>
                  {discountLabel}
                </span>
              </span>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--main)" }}>-{(pricing.base * pricing.discount).toFixed(2)}€</span>
            </div>
          )}

          <div style={{ height: 1, background: "var(--line)", marginBlock: 8 }} />
          <div className="flex justify-between items-baseline">
            <span className="font-sans font-medium" style={{ fontSize: 13, color: "var(--body)" }}>Total</span>
            <span className="font-serif" style={{ fontSize: 32, color: "var(--body)" }}>{pricing.total.toFixed(2)}€</span>
          </div>
          <p className="font-mono text-right" style={{ fontSize: 10, color: "var(--gry)", marginTop: 2 }}>TVA incluse</p>
        </div>
      )}

      {/* CTA — poussé en bas */}
      {!paymentEmbedded && (
        <div className="mt-auto pt-6">
          {isConfirmStep ? (
            <button
              onClick={onConfirm}
              disabled={!canProceed}
              className="w-full flex items-center justify-center font-sans font-medium transition-opacity disabled:opacity-40"
              style={{
                height: 52,
                borderRadius: 999,
                background: "var(--btn)",
                color: "var(--body)",
                border: "none",
                fontSize: 15,
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
            >
              <Icon name="check" size={15} stroke="var(--body)" sw={2.5} />
              <span className="ml-2">Confirmer et payer — {pricing.total.toFixed(2)}€</span>
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full flex items-center justify-center gap-2 font-sans font-medium transition-opacity disabled:opacity-40"
              style={{
                height: 52,
                borderRadius: 999,
                background: "var(--body)",
                color: "white",
                border: "none",
                fontSize: 15,
                cursor: canProceed ? "pointer" : "not-allowed",
              }}
            >
              Continuer
              <Icon name="chevRight" size={16} stroke="white" sw={2} />
            </button>
          )}
          <p className="font-mono text-center mt-3" style={{ fontSize: 10, color: "var(--gry)" }}>
            PAIEMENT SÉCURISÉ · ANNULATION J-1
          </p>
        </div>
      )}
    </aside>
  )
}
