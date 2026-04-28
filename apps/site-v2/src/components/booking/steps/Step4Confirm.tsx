"use client"

import { Icon } from "@/components/ui/Icon"
import type { BookingState, BookingService, PriceBreakdown, Space } from "@/types/booking"
import { RecapCard, FidelityCard } from "./Step4Recap"

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

// ─── Payment card (desktop dark card) ────────────────────────────────────────

function PaymentCard() {
  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)", padding: "14px 16px" }}>
      <p className="eyebrow mb-3" style={{ color: "var(--gry)" }}>Moyen de paiement</p>
      <div style={{ background: "var(--body)", color: "#fff", borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden", marginBottom: 10 }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(242,211,129,0.14)" }} />
        <div className="flex justify-between items-center">
          <div>
            <div style={{ width: 28, height: 20, borderRadius: 4, background: "var(--btn)", marginBottom: 10 }} />
            <p className="font-mono" style={{ fontSize: 14, letterSpacing: "0.1em" }}>•• •• •• 4242</p>
            <div className="flex gap-4 mt-1.5" style={{ fontSize: 10, opacity: 0.65 }}>
              <span>09/27</span>
              <span>Claire D.</span>
            </div>
          </div>
          <Icon name="check" size={18} stroke="var(--btn)" sw={2.5} />
        </div>
      </div>
      <button
        style={{ width: "100%", padding: 10, background: "transparent", border: "1px dashed var(--line)", borderRadius: 10, fontSize: 12.5, color: "var(--gry)", cursor: "pointer" }}
      >
        + Ajouter un moyen de paiement
      </button>
      <div className="flex items-center gap-1.5 mt-2">
        <Icon name="shield" size={12} stroke="var(--gry)" />
        <span className="font-mono" style={{ fontSize: 10, color: "var(--gry)" }}>Paiement sécurisé SSL</span>
      </div>
    </div>
  )
}

// ─── CGU notice (desktop right col) ──────────────────────────────────────────

function CguNotice() {
  return (
    <div style={{ padding: 14, border: "1px solid var(--line)", borderRadius: 14, fontSize: 11.5, color: "var(--gry)", lineHeight: 1.55 }}>
      En confirmant, vous acceptez les CGU et la politique d'annulation. Annulation gratuite jusqu'à 24h avant le créneau.
    </div>
  )
}

// ─── CTA button ───────────────────────────────────────────────────────────────

interface CtaButtonProps {
  onClick: () => void
  isLoading: boolean
  total: number
}

function CtaButton({ onClick, isLoading, total }: CtaButtonProps) {
  return (
    <div className="flex flex-col items-center" style={{ gap: 10 }}>
      <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center font-sans font-medium transition-opacity disabled:opacity-60"
        style={{ height: 52, borderRadius: 999, background: "var(--btn)", color: "var(--body)", border: "none", fontSize: 15, cursor: isLoading ? "not-allowed" : "pointer" }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 3a9 9 0 109 9" />
            </svg>
            Traitement...
          </span>
        ) : (
          `Confirmer et payer — ${total.toFixed(2)}€`
        )}
      </button>
      <p className="font-mono text-center" style={{ fontSize: 11, color: "var(--gry)" }}>
        Annulation gratuite jusqu'à 24h avant
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
  onConfirm: () => void
  isLoading: boolean
}

export function Step4Confirm({ state, pricing, spaces, services, onConfirm, isLoading }: Step4ConfirmProps) {
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
          <PaymentCard />
        </div>

        {/* Col right: price breakdown + fidelity + CGU + CTA */}
        <div className="flex flex-col" style={{ gap: 14 }}>
          <PriceBreakdownCard pricing={pricing} space={space} selectedServices={selectedServices} />
          <FidelityCard pricing={pricing} />
          <CguNotice />
          <CtaButton onClick={onConfirm} isLoading={isLoading} total={pricing.total} />
        </div>
      </div>
    </div>
  )
}
