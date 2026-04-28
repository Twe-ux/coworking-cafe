"use client"

import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/cn"
import type { Space } from "@/types/booking"

// Per-space color palette (local to this component — not in shared types)
interface SpaceTheme {
  color: string
  bg: string
}

const SPACE_THEMES: Record<string, SpaceTheme> = {
  "open-space":     { color: "#417972", bg: "rgba(65,121,114,0.10)" },
  "salle-verriere": { color: "#5A938B", bg: "rgba(90,147,139,0.14)" },
  "salle-etage":    { color: "#8A6B1F", bg: "rgba(242,211,129,0.22)" },
  "evenementiel":   { color: "#C0534C", bg: "rgba(192,83,76,0.10)" },
}

const DEFAULT_THEME: SpaceTheme = { color: "var(--main)", bg: "rgba(65,121,114,0.10)" }

const SPACE_FEATURES: Record<string, string[]> = {
  "open-space":     ["Wi-Fi fibre 1 Gb/s", "Boissons illimitées", "Casier sécurisé"],
  "salle-verriere": ["Lumière naturelle", 'Écran 55"', "Visio intégrée"],
  "salle-etage":    ["Privatisé", "Tableau blanc", "Boissons incluses"],
  "evenementiel":   ["Privatisation totale", "Sono + lumières", "Service traiteur"],
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Step1SpaceProps {
  spaces: Space[]
  selectedSpaceId: string | null
  onSelect: (spaceId: string) => void
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

interface MobileCardProps {
  space: Space
  theme: SpaceTheme
  selected: boolean
  onSelect: () => void
}

function MobileCard({ space, theme, selected, onSelect }: MobileCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${space.name}, dès ${space.pricePerHour}€/h, jusqu'à ${space.maxPeople} personnes`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect() }}
      className={cn(
        "flex flex-row items-center gap-4 p-4 rounded-[18px] cursor-pointer",
        "transition-all duration-200 border-2 bg-white",
        selected ? "border-[var(--main)]" : "border-[var(--line)]"
      )}
      style={{
        boxShadow: selected ? `0 6px 18px ${theme.bg}` : "none",
        borderColor: selected ? theme.color : undefined,
      }}
    >
      {/* Space icon */}
      <div
        className="shrink-0 w-14 h-14 rounded-[14px] flex items-center justify-center"
        style={{ background: theme.bg }}
      >
        <Icon name={space.icon} size={26} stroke={theme.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[16px] text-[var(--body)] leading-tight">
            {space.name}
          </span>
          {selected && (
            <span
              className="shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full"
              style={{ background: theme.color }}
            >
              <Icon name="check" size={11} stroke="#fff" strokeWidth={3} />
            </span>
          )}
        </div>
        <p className="font-sans text-[12px] text-[var(--gry)] mt-0.5 leading-snug truncate">
          {space.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-[13px] font-medium text-[var(--body)]">
            dès {space.pricePerHour}€
            <span className="font-normal text-[var(--gry)] text-[11px]">/h</span>
          </span>
          <span className="text-[11px] text-[var(--gry)]">·</span>
          <span className="font-sans text-[11px] text-[var(--gry)]">
            jusqu'à {space.maxPeople} pers.
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Desktop card ─────────────────────────────────────────────────────────────

interface DesktopCardProps {
  space: Space
  theme: SpaceTheme
  features: string[]
  selected: boolean
  onSelect: () => void
}

function DesktopCard({ space, theme, features, selected, onSelect }: DesktopCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${space.name}, dès ${space.pricePerHour}€/h, jusqu'à ${space.maxPeople} personnes`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect() }}
      className="relative overflow-hidden rounded-[18px] p-[22px] cursor-pointer transition-all duration-200 border-2 bg-white"
      style={{
        borderColor: selected ? theme.color : "var(--line)",
        boxShadow: selected ? `0 8px 24px ${theme.bg}` : "none",
      }}
    >
      {/* Check badge (visible when selected) */}
      {selected && (
        <div
          className="absolute top-[14px] right-[14px] w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: theme.color }}
        >
          <Icon name="check" size={13} stroke="#fff" strokeWidth={2.5} />
        </div>
      )}

      {/* Space icon */}
      <div
        className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mb-[14px]"
        style={{ background: theme.bg }}
      >
        <Icon name={space.icon} size={32} stroke={theme.color} />
      </div>

      {/* Title */}
      <p className="font-serif text-[22px] text-[var(--body)] leading-tight mb-1">
        {space.name}
      </p>

      {/* Description */}
      <p className="font-sans text-[12.5px] text-[var(--gry)] mb-[14px] min-h-[32px] leading-snug">
        {space.description}
      </p>

      {/* Features */}
      <ul className="flex flex-col gap-[6px] mb-[14px]">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 font-sans text-[11.5px] text-[var(--body)]">
            <Icon name="check" size={11} stroke={theme.color} strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 border-t"
        style={{ borderColor: "var(--line)" }}
      >
        <span className="font-mono text-[16px] font-medium text-[var(--body)]">
          dès {space.pricePerHour}€
          <span className="font-normal text-[var(--gry)] text-[12px]">/h</span>
        </span>
        <span className="font-sans text-[11px] text-[var(--gry)]">
          jusqu'à {space.maxPeople} pers.
        </span>
      </div>
    </div>
  )
}

// ─── Step1Space ───────────────────────────────────────────────────────────────

export function Step1Space({ spaces, selectedSpaceId, onSelect }: Step1SpaceProps) {
  return (
    <div className="px-6 max-w-[680px] mx-auto md:max-w-none md:px-0">
      <h2 className="font-serif text-[28px] text-[var(--body)] leading-tight">
        Quel <em className="italic" style={{ color: "var(--main)" }}>espace</em> ?
      </h2>
      <p className="font-sans text-[14px] text-[var(--gry)] mt-1 mb-6">
        Choisissez parmi nos espaces disponibles.
      </p>

      {/* Mobile: vertical list */}
      <div className="flex flex-col gap-3 md:hidden">
        {spaces.map((space) => {
          const theme = SPACE_THEMES[space.id] ?? DEFAULT_THEME
          return (
            <MobileCard
              key={space.id}
              space={space}
              theme={theme}
              selected={selectedSpaceId === space.id}
              onSelect={() => onSelect(space.id)}
            />
          )
        })}
      </div>

      {/* Desktop: 2-col grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-[14px]">
        {spaces.map((space) => {
          const theme = SPACE_THEMES[space.id] ?? DEFAULT_THEME
          const features = SPACE_FEATURES[space.id] ?? []
          return (
            <DesktopCard
              key={space.id}
              space={space}
              theme={theme}
              features={features}
              selected={selectedSpaceId === space.id}
              onSelect={() => onSelect(space.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
