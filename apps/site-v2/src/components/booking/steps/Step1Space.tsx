"use client"

import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/cn"
import type { Space } from "@/types/booking"

interface Step1SpaceProps {
  spaces: Space[]
  selectedSpaceId: string | null
  onSelect: (spaceId: string) => void
}

interface SpaceCardProps {
  space: Space
  selected: boolean
  onSelect: () => void
}

function SpaceCard({ space, selected, onSelect }: SpaceCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${space.name}, ${space.pricePerHour}€/h`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect() }}
      className={cn(
        "flex flex-row items-start gap-4 p-5 rounded-2xl cursor-pointer",
        "transition-all duration-150",
        "border bg-white",
        selected
          ? "border-[2px] border-[var(--main)] bg-[rgba(65,121,114,0.04)]"
          : "border-[1.5px] border-[var(--line)]"
      )}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center"
        style={{ background: "rgba(65,121,114,0.1)" }}
      >
        <Icon name={space.icon} size={18} stroke="var(--main)" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[18px] text-[var(--body)] leading-snug">
          {space.name}
        </p>
        <p className="font-sans text-[13px] text-[var(--gry)] mt-1 leading-snug truncate">
          {space.description}
        </p>
      </div>

      {/* Price + indicator */}
      <div className="shrink-0 flex flex-col items-end gap-2 pt-0.5">
        <span className="font-mono text-[16px] font-bold text-[var(--body)] leading-none">
          {space.pricePerHour}€
          <span className="font-normal text-[var(--gry)] text-[12px]">/h</span>
        </span>
        {/* Selection circle */}
        <div
          className={cn(
            "w-5 h-5 rounded-full border-[1.5px] transition-all duration-150",
            selected
              ? "bg-[var(--main)] border-[var(--main)]"
              : "bg-transparent border-[var(--line)]"
          )}
        />
      </div>
    </div>
  )
}

export function Step1Space({ spaces, selectedSpaceId, onSelect }: Step1SpaceProps) {
  return (
    <div className="px-6 max-w-[680px] mx-auto">
      <h2 className="font-serif text-[28px] text-[var(--body)] leading-tight">
        Quel <em className="italic text-[var(--main)]">espace</em> ?
      </h2>
      <p className="font-sans text-[14px] text-[var(--gry)] mt-1 mb-6">
        Choisissez parmi nos espaces disponibles.
      </p>

      {/* Mobile: vertical list / Desktop: 2-col grid */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            selected={selectedSpaceId === space.id}
            onSelect={() => onSelect(space.id)}
          />
        ))}
      </div>
    </div>
  )
}
