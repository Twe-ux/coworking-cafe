"use client"

import { Icon } from "@/components/ui/Icon"
import type { Space, BookingState, BookingService, PriceBreakdown } from "@/types/booking"
import { TYPE_LABELS } from "@/types/booking"

// ─── Space color mapping ──────────────────────────────────────────────────────

interface SpaceColors {
  bg: string
  color: string
  iconName: import("@/components/ui/Icon").IconName
}

const SPACE_COLORS: Record<string, SpaceColors> = {
  "open-space":     { bg: "rgba(65,121,114,0.1)",   color: "#417972", iconName: "monitor" },
  "salle-verriere": { bg: "rgba(90,147,139,0.14)",  color: "#5A938B", iconName: "users" },
  "salle-etage":    { bg: "rgba(242,211,129,0.22)", color: "#8A6B1F", iconName: "layout" },
  "evenementiel":   { bg: "rgba(192,83,76,0.1)",    color: "#C0534C", iconName: "star" },
}

const DEFAULT_SPACE_COLORS: SpaceColors = {
  bg: "rgba(65,121,114,0.1)",
  color: "#417972",
  iconName: "building",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RecapHeaderProps {
  space: Space
  colors: SpaceColors
}

function RecapHeader({ space, colors }: RecapHeaderProps) {
  return (
    <div
      style={{
        padding: "18px 16px 14px",
        background: colors.bg,
        borderRadius: "18px 18px 0 0",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: colors.bg,
          color: colors.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1.5px solid ${colors.color}22`,
        }}
      >
        <Icon name={colors.iconName} size={26} stroke={colors.color} />
      </div>
      <div>
        <p className="font-mono uppercase" style={{ fontSize: 10, letterSpacing: "0.14em", color: colors.color, margin: 0 }}>
          Espace réservé
        </p>
        <p className="font-serif" style={{ fontSize: 20, color: "var(--body)", margin: 0, marginTop: 2 }}>
          {space.name}
        </p>
      </div>
    </div>
  )
}

interface RecapBodyProps {
  state: BookingState
  selectedServices: BookingService[]
}

function RecapBody({ state, selectedServices }: RecapBodyProps) {
  const typeInfo = TYPE_LABELS[state.bookingType]
  const rows: [string, string][] = [
    ["Type", typeInfo.label],
    ["Date", state.date ?? "—"],
    ...(state.bookingType === "hourly" ? [["Horaire", state.startTime ?? "—"] as [string, string]] : []),
    ["Personnes", `${state.people} personne${state.people > 1 ? "s" : ""}`],
    ["Services", selectedServices.length > 0 ? selectedServices.map((s) => s.label).join(", ") : "Aucun"],
  ]

  return (
    <div style={{ padding: "14px 16px" }}>
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className="flex justify-between"
          style={{ paddingBlock: 8, borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none" }}
        >
          <span className="font-sans" style={{ fontSize: 12.5, color: "var(--gry)" }}>{label}</span>
          <span className="font-sans" style={{ fontSize: 13, color: "var(--body)", fontWeight: 500 }}>{value}</span>
        </div>
      ))}
      {state.specialRequest && (
        <div className="mt-3" style={{ background: "rgba(65,121,114,0.06)", borderRadius: 8, padding: 12 }}>
          <p className="eyebrow mb-1" style={{ color: "var(--main)" }}>Demande spéciale</p>
          <p className="font-sans" style={{ fontSize: 13, color: "var(--body)" }}>{state.specialRequest}</p>
        </div>
      )}
    </div>
  )
}

// ─── Exported components ──────────────────────────────────────────────────────

interface RecapCardProps {
  space: Space
  state: BookingState
  selectedServices: BookingService[]
}

export function RecapCard({ space, state, selectedServices }: RecapCardProps) {
  const colors = SPACE_COLORS[space.id] ?? DEFAULT_SPACE_COLORS

  return (
    <div style={{ background: "white", borderRadius: 18, border: "1px solid var(--line)", overflow: "hidden" }}>
      <RecapHeader space={space} colors={colors} />
      <RecapBody state={state} selectedServices={selectedServices} />
    </div>
  )
}

interface FidelityCardProps {
  pricing: PriceBreakdown
}

export function FidelityCard({ pricing }: FidelityCardProps) {
  const points = Math.floor(pricing.total / 2)

  return (
    <div style={{ background: "rgba(242,211,129,0.18)", borderRadius: 16, padding: 18, display: "flex", gap: 12 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--btn)",
          color: "var(--btn-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name="sparkle" size={20} stroke="var(--btn-dark)" fill="var(--btn-dark)" />
      </div>
      <div>
        <p className="font-serif" style={{ fontSize: 17, color: "var(--body)", margin: 0 }}>
          +{points} points fidélité
        </p>
        <p className="font-sans" style={{ fontSize: 12, color: "rgba(107,85,24,0.85)", marginTop: 3, lineHeight: 1.5 }}>
          Avec cette réservation, vous rapprochez de votre prochaine récompense.
        </p>
      </div>
    </div>
  )
}
