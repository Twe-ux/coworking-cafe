"use client"

import { cn } from "@/lib/cn"
import type { BookingType } from "@/types/booking"
import { TYPE_LABELS } from "@/types/booking"

interface Step2DateTimeProps {
  bookingType: BookingType
  date: string | null
  startTime: string | null
  people: number
  maxPeople: number
  onTypeChange: (type: BookingType) => void
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  onPeopleChange: (n: number) => void
}

const BOOKING_TYPES: BookingType[] = ["hourly", "daily", "weekly", "monthly"]
const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

function sectionClass() {
  return "pt-6 border-t border-[var(--line)]"
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>
}

function buildDateChips(): Array<{ label: string; value: string }> {
  const chips: Array<{ label: string; value: string }> = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const value = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })
    chips.push({ label, value })
  }
  return chips
}

export function Step2DateTime({
  bookingType,
  date,
  startTime,
  people,
  maxPeople,
  onTypeChange,
  onDateChange,
  onTimeChange,
  onPeopleChange,
}: Step2DateTimeProps) {
  const dateChips = buildDateChips()

  return (
    <div className="px-6 max-w-[680px] mx-auto space-y-0">
      {/* Section 1 — Type */}
      <section>
        <Eyebrow>Type de réservation</Eyebrow>
        <div className="grid grid-cols-2 gap-2">
          {BOOKING_TYPES.map((type) => {
            const { label, sublabel } = TYPE_LABELS[type]
            const active = bookingType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                className={cn(
                  "flex flex-col gap-1 p-4 rounded-[12px] text-left cursor-pointer transition-all duration-150",
                  active
                    ? "bg-[var(--main)] border-0 text-white"
                    : "bg-white border border-[var(--line)] text-[var(--body)]"
                )}
              >
                <span className="font-sans text-[14px] font-medium">{label}</span>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ opacity: 0.6 }}
                >
                  {sublabel}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Section 2 — Date */}
      <section className={sectionClass()}>
        <Eyebrow>Date</Eyebrow>
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {dateChips.map(({ label, value }) => {
            const active = date === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onDateChange(value)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 font-mono text-[12px] whitespace-nowrap cursor-pointer transition-all duration-150",
                  active
                    ? "bg-[var(--btn)] text-[var(--body)] border-0"
                    : "bg-white border border-[var(--line)] text-[var(--body)]"
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Section 3 — Time slots (hourly only) */}
      {bookingType === "hourly" && (
        <section className={sectionClass()}>
          <Eyebrow>Heure de début</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => {
              const active = startTime === slot
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onTimeChange(slot)}
                  className={cn(
                    "px-3 py-2 rounded-[8px] font-mono text-[13px] cursor-pointer transition-all duration-150",
                    active
                      ? "bg-[var(--body)] text-white"
                      : "text-[var(--main)] hover:bg-[var(--main)] hover:text-white",
                    !active && "bg-[rgba(65,121,114,0.08)]"
                  )}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Section 4 — People stepper */}
      <section className={sectionClass()}>
        <Eyebrow>Participants</Eyebrow>
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
          >
            −
          </button>

          <div className="flex flex-col items-center min-w-[32px]">
            <span className="font-serif text-[24px] text-[var(--body)] leading-none">{people}</span>
            <span className="font-mono text-[10px] text-[var(--gry)] uppercase mt-1">
              max {maxPeople}
            </span>
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
          >
            +
          </button>
        </div>
      </section>
    </div>
  )
}
