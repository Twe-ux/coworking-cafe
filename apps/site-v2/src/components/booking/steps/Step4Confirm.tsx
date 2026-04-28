"use client"

import type React from "react"
import type { BookingState, BookingService, PriceBreakdown, Space } from "@/types/booking"
import { RecapCard, FidelityCard } from "./Step4Recap"
import { StripePaymentForm } from "@/components/booking/StripePaymentForm"

// ─── Price row ────────────────────────────────────────────────────────────────

function PriceRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ paddingBlock: 5 }}>
      <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 13, color: "var(--body)" }}>{value}</span>
    </div>
  )
}

// ─── Price breakdown card ─────────────────────────────────────────────────────

interface PriceBreakdownCardProps {
  pricing: PriceBreakdown
  space: Space | undefined
  selectedServices: BookingService[]
}

function PriceBreakdownCard({ pricing, space, selectedServices }: PriceBreakdownCardProps) {
  const discountLabel = pricing.discount > 0 ? `-${Math.round(pricing.discount * 100)}%` : null

  return (
    <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
      <PriceRow
        label={`Base (${pricing.hours}h × ${space?.pricePerHour ?? 0}€)`}
        value={`${pricing.base.toFixed(2)}€`}
      />
      {discountLabel && (
        <div className="flex items-center justify-between" style={{ paddingBlock: 5 }}>
          <span className="flex items-center gap-2 font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>
            Remise forfait
            <span
              className="font-mono"
              style={{ fontSize: 11, color: "var(--main)", background: "rgba(65,121,114,0.12)", borderRadius: 99, paddingInline: 6, paddingBlock: 2 }}
            >
              {discountLabel}
            </span>
          </span>
          <span className="font-mono" style={{ fontSize: 13, color: "var(--main)" }}>
            -{(pricing.base * pricing.discount).toFixed(2)}€
          </span>
        </div>
      )}
      {selectedServices.map((service) => (
        <PriceRow key={service.id} label={service.label} value={`+${service.price.toFixed(2)}€`} />
      ))}
      <div style={{ height: 1, background: "var(--line)", marginBlock: 10 }} />
      <div className="flex items-baseline justify-between">
        <span className="font-sans font-semibold" style={{ fontSize: 14, color: "var(--body)" }}>Total TTC</span>
        <span className="font-serif" style={{ fontSize: 24, color: "var(--body)" }}>
          {pricing.total.toFixed(2)}€
        </span>
      </div>
      <p className="font-mono text-right mt-1" style={{ fontSize: 10, color: "var(--gry)" }}>
        TVA incluse · Annulation 24h
      </p>
    </div>
  )
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

interface Step4ConfirmProps {
  state: BookingState
  pricing: PriceBreakdown
  spaces: Space[]
  services: BookingService[]
  clientSecret: string | null
  isCreatingIntent: boolean
  intentError: string | null
}

export function Step4Confirm({
  state,
  pricing,
  spaces,
  services,
  clientSecret,
  intentError,
}: Step4ConfirmProps) {
  const space = spaces.find((s) => s.id === state.spaceId)
  const selectedServices = services.filter((s) => state.services.includes(s.id))

  if (!space) {
    return (
      <div className="flex flex-col mx-auto" style={{ maxWidth: 560, gap: 20 }}>
        <p className="font-sans" style={{ color: "var(--gry)" }}>Espace introuvable.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 960 }}>
      {/* Mobile: single column / Desktop: 2-col grid */}
      <div className="grid md:grid-cols-2" style={{ gap: 16 }}>
        {/* Col left: recap + payment */}
        <div className="flex flex-col" style={{ gap: 14 }}>
          <RecapCard space={space} state={state} selectedServices={selectedServices} />

          {/* Payment section */}
          <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)", padding: "14px 16px" }}>
            <p className="eyebrow mb-3" style={{ color: "var(--gry)" }}>Moyen de paiement</p>
            {clientSecret ? (
              <StripePaymentForm clientSecret={clientSecret} total={pricing.total} />
            ) : intentError ? (
              <p className="font-sans" style={{ fontSize: 13, color: "var(--danger)" }}>{intentError}</p>
            ) : (
              // Skeleton loader
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[100, 60, 100].map((w, i) => (
                  <div
                    key={i}
                    style={{ height: 36, background: "var(--line)", borderRadius: 8, width: `${w}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col right: price breakdown + fidelity + CGU */}
        <div className="flex flex-col" style={{ gap: 14 }}>
          <PriceBreakdownCard pricing={pricing} space={space} selectedServices={selectedServices} />
          <FidelityCard pricing={pricing} />
          <p className="font-sans" style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 14, fontSize: 11.5, color: "var(--gry)", lineHeight: 1.55 }}>
            En confirmant, vous acceptez les CGU et la politique d&apos;annulation. Annulation gratuite jusqu&apos;à 24h avant le créneau.
          </p>
        </div>
      </div>
    </div>
  )
}
