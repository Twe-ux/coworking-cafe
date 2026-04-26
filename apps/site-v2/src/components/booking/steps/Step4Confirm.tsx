"use client"

import { Icon } from "@/components/ui/Icon"
import type { BookingState, BookingService, PriceBreakdown, Space } from "@/types/booking"
import { TYPE_LABELS } from "@/types/booking"

interface Step4ConfirmProps {
  state: BookingState
  pricing: PriceBreakdown
  spaces: Space[]
  services: BookingService[]
  onConfirm: () => void
  isLoading: boolean
}

// ─── Price row helper ─────────────────────────────────────────────────────────

function PriceRow({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between" style={{ paddingBlock: 5 }}>
      <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 13, color: "var(--body)" }}>{value}</span>
    </div>
  )
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────

export function Step4Confirm({
  state,
  pricing,
  spaces,
  services,
  onConfirm,
  isLoading,
}: Step4ConfirmProps) {
  const space = spaces.find((s) => s.id === state.spaceId)
  const selectedServices = services.filter((s) => state.services.includes(s.id))
  const typeInfo = TYPE_LABELS[state.bookingType]
  const discountLabel = pricing.discount > 0 ? `-${Math.round(pricing.discount * 100)}%` : null

  return (
    <div className="flex flex-col mx-auto" style={{ maxWidth: 560, gap: 20 }}>
      {/* Récapitulatif */}
      <div
        className="flex flex-col"
        style={{ background: "white", borderRadius: 16, border: "1px solid var(--line)", padding: 20, gap: 0 }}
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-serif" style={{ fontSize: 18, color: "var(--body)", margin: 0 }}>
            {space?.name ?? "Espace"}
          </h3>
          <p className="font-mono mt-1" style={{ fontSize: 12, color: "var(--gry)" }}>
            {state.date ?? "—"} · {state.startTime ?? "—"}
          </p>
        </div>

        <div style={{ height: 1, background: "var(--line)", marginBottom: 14 }} />

        {/* Lignes détail */}
        <div className="flex flex-col">
          {([
            ["Type", typeInfo.label],
            ["Date", state.date ?? "—"],
            ...(state.bookingType === "hourly" ? [["Heure", state.startTime ?? "—"]] : []),
            ["Personnes", String(state.people)],
            ["Services", selectedServices.length > 0 ? selectedServices.map((s) => s.label).join(", ") : "Aucun"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between" style={{ paddingBlock: 8, borderBottom: "1px solid var(--line)" }}>
              <span className="font-sans" style={{ fontSize: 13, color: "var(--gry)" }}>{label}</span>
              <span className="font-sans" style={{ fontSize: 13, color: "var(--body)", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Demande spéciale */}
        {state.specialRequest && (
          <div
            className="mt-3"
            style={{ background: "rgba(65,121,114,0.06)", borderRadius: 8, padding: 12 }}
          >
            <p className="eyebrow mb-1" style={{ color: "var(--main)" }}>Demande spéciale</p>
            <p className="font-sans" style={{ fontSize: 13, color: "var(--body)" }}>{state.specialRequest}</p>
          </div>
        )}
      </div>

      {/* Breakdown prix */}
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
                style={{ fontSize: 11, color: "#227558", background: "rgba(34,117,88,0.12)", borderRadius: 99, paddingInline: 6, paddingBlock: 2 }}
              >
                {discountLabel}
              </span>
            </span>
            <span className="font-mono" style={{ fontSize: 13, color: "#227558" }}>
              -{(pricing.base * pricing.discount).toFixed(2)}€
            </span>
          </div>
        )}

        {selectedServices.map((service) => (
          <PriceRow key={service.id} label={service.label} value={`+${service.price.toFixed(2)}€`} />
        ))}

        <div style={{ height: 1, background: "var(--line)", marginBlock: 10 }} />

        {/* Total */}
        <div className="flex items-baseline justify-between">
          <span className="font-sans font-semibold" style={{ fontSize: 14, color: "var(--body)" }}>Total</span>
          <span className="font-serif" style={{ fontSize: 24, color: "var(--body)" }}>
            {pricing.total.toFixed(2)}€
          </span>
        </div>
        <p className="font-mono text-right mt-1" style={{ fontSize: 10, color: "var(--gry)" }}>
          TVA incluse · Annulation 24h
        </p>
      </div>

      {/* Placeholder paiement */}
      <div>
        <p className="eyebrow mb-3" style={{ color: "var(--gry)" }}>Mode de paiement</p>
        <div
          style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)", padding: 16 }}
        >
          {/* Input simulé */}
          <div className="flex items-center justify-between">
            <span className="font-mono" style={{ fontSize: 14, color: "var(--gry)" }}>
              •••• •••• •••• ••••
            </span>
            <Icon name="wallet" size={18} stroke="var(--gry)" />
          </div>
          {/* Logos */}
          <p className="font-mono mt-2" style={{ fontSize: 11, color: "var(--gry)" }}>
            Visa · Mastercard · CB
          </p>
        </div>
        {/* Badge sécurité */}
        <div className="flex items-center gap-1.5 mt-2">
          <Icon name="shield" size={12} stroke="var(--gry)" />
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gry)" }}>
            Paiement sécurisé SSL
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center" style={{ gap: 10 }}>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full flex items-center justify-center font-sans font-medium transition-opacity disabled:opacity-60"
          style={{
            height: 52,
            borderRadius: 999,
            background: "var(--btn)",
            color: "var(--body)",
            border: "none",
            fontSize: 15,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 3a9 9 0 109 9"/>
              </svg>
              Traitement...
            </span>
          ) : (
            `Confirmer et payer — ${pricing.total.toFixed(2)}€`
          )}
        </button>
        <p className="font-mono text-center" style={{ fontSize: 11, color: "var(--gry)" }}>
          Annulation gratuite jusqu'à 24h avant
        </p>
      </div>
    </div>
  )
}
