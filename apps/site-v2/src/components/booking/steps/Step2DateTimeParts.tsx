"use client"

import { cn } from "@/lib/cn"
import { Icon } from "@/components/ui/Icon"

// ── Shared utility ────────────────────────────────────────────────────────────

export function formatDuration(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  const totalMin = eh * 60 + em - sh * 60 - sm
  if (totalMin <= 0) return ""
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}

// ── TimeSlots ─────────────────────────────────────────────────────────────────

export interface TimeSlotsProps {
  slots: string[]
  active: string | null
  onSelect: (slot: string) => void
  layout: "scroll" | "grid"
}

export function TimeSlots({ slots, active, onSelect, layout }: TimeSlotsProps) {
  if (layout === "scroll") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={cn(
              "shrink-0 px-3 py-[10px] rounded-[10px] font-mono text-[13px] cursor-pointer transition-all duration-150",
              active === slot
                ? "bg-[var(--body)] text-white"
                : "bg-white border border-[var(--line)] text-[var(--body)] hover:border-[var(--main)]"
            )}
          >
            {slot}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-5 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelect(slot)}
          className={cn(
            "px-3 py-[10px] rounded-[10px] font-mono text-[13px] text-center cursor-pointer transition-all duration-150",
            active === slot
              ? "bg-[var(--body)] text-white"
              : "bg-white border border-[var(--line)] text-[var(--body)] hover:border-[var(--main)]"
          )}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}

// ── DurationRow ───────────────────────────────────────────────────────────────

interface DurationRowProps {
  startTime: string
  endTime: string
}

export function DurationRow({ startTime, endTime }: DurationRowProps) {
  const duration = formatDuration(startTime, endTime)
  if (!duration) return null
  return (
    <div className="flex items-center gap-2 py-3" style={{ borderTop: "1px solid var(--line)" }}>
      <span className="font-mono text-[13px] text-[var(--body)]">{startTime}</span>
      <span className="font-mono text-[11px] text-[var(--gry)]">→</span>
      <span className="font-mono text-[13px] text-[var(--body)]">{endTime}</span>
      <span className="font-mono text-[11px] text-[var(--gry)]">·</span>
      <span className="font-mono text-[13px] text-[var(--main)] font-medium">{duration}</span>
    </div>
  )
}

// ── DailyCard ─────────────────────────────────────────────────────────────────

export function DailyCard() {
  return (
    <div className="flex items-center justify-between p-4 rounded-[14px] bg-white border border-[var(--line)]">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-[14px] text-[var(--body)] font-medium">Journée complète</span>
        <span className="font-mono text-[11px] text-[var(--gry)]">9h – 19h</span>
      </div>
      <Icon name="sparkle" size={18} stroke="var(--main)" />
    </div>
  )
}

// ── PeopleStepper ─────────────────────────────────────────────────────────────

interface PeopleStepperProps {
  people: number
  maxPeople: number
  onPeopleChange: (n: number) => void
}

export function PeopleStepper({ people, maxPeople, onPeopleChange }: PeopleStepperProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Réduire le nombre de participants"
        disabled={people <= 1}
        onClick={() => onPeopleChange(Math.max(1, people - 1))}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center font-sans text-[18px]",
          "bg-[rgba(0,0,0,0.06)] text-[var(--body)] transition-opacity",
          people <= 1 && "opacity-30 cursor-not-allowed"
        )}
      >−</button>
      <div className="flex flex-col items-center min-w-[32px]">
        <span className="font-serif text-[24px] text-[var(--body)] leading-none">{people}</span>
        <span className="font-mono text-[10px] text-[var(--gry)] uppercase mt-1">max {maxPeople}</span>
      </div>
      <button
        type="button"
        aria-label="Augmenter le nombre de participants"
        disabled={people >= maxPeople}
        onClick={() => onPeopleChange(Math.min(maxPeople, people + 1))}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center font-sans text-[18px]",
          "bg-[rgba(0,0,0,0.06)] text-[var(--body)] transition-opacity",
          people >= maxPeople && "opacity-30 cursor-not-allowed"
        )}
      >+</button>
    </div>
  )
}
