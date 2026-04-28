"use client"

import { cn } from "@/lib/cn"
import type { BookingType } from "@/types/booking"
import { DateCalendar } from "./DateCalendar"
import { TypeCards } from "./TypeCards"

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

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

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

function PeopleStepper({
  people, maxPeople, onPeopleChange,
}: { people: number; maxPeople: number; onPeopleChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <button type="button" aria-label="Réduire le nombre de participants" disabled={people <= 1}
        onClick={() => onPeopleChange(Math.max(1, people - 1))}
        className={cn("w-9 h-9 rounded-full flex items-center justify-center font-sans text-[18px]",
          "bg-[rgba(0,0,0,0.06)] text-[var(--body)] transition-opacity", people <= 1 && "opacity-30 cursor-not-allowed")}
      >−</button>
      <div className="flex flex-col items-center min-w-[32px]">
        <span className="font-serif text-[24px] text-[var(--body)] leading-none">{people}</span>
        <span className="font-mono text-[10px] text-[var(--gry)] uppercase mt-1">max {maxPeople}</span>
      </div>
      <button type="button" aria-label="Augmenter le nombre de participants" disabled={people >= maxPeople}
        onClick={() => onPeopleChange(Math.min(maxPeople, people + 1))}
        className={cn("w-9 h-9 rounded-full flex items-center justify-center font-sans text-[18px]",
          "bg-[rgba(0,0,0,0.06)] text-[var(--body)] transition-opacity", people >= maxPeople && "opacity-30 cursor-not-allowed")}
      >+</button>
    </div>
  )
}

export function Step2DateTime({
  bookingType, date, startTime, people, maxPeople,
  onTypeChange, onDateChange, onTimeChange, onPeopleChange,
}: Step2DateTimeProps) {
  const dateChips = buildDateChips()
  const sep = "pt-6 border-t border-[var(--line)]"

  return (
    <div className="px-6 max-w-[680px] mx-auto">
      {/* ── Desktop: 2-column grid ── */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-[18px]">
        <div className="flex flex-col gap-6">
          <section>
            <Eyebrow>Type de réservation</Eyebrow>
            <TypeCards bookingType={bookingType} onTypeChange={onTypeChange} iconSize={20} />
          </section>
          <section className={sep}>
            <Eyebrow>Participants</Eyebrow>
            <PeopleStepper people={people} maxPeople={maxPeople} onPeopleChange={onPeopleChange} />
          </section>
          {bookingType === "hourly" && (
            <section className={sep}>
              <Eyebrow>Heure de début</Eyebrow>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button key={slot} type="button" onClick={() => onTimeChange(slot)}
                    className={cn("py-[11px] rounded-[10px] font-mono text-[13px] text-center cursor-pointer transition-all duration-150",
                      startTime === slot
                        ? "bg-[var(--body)] text-white"
                        : "bg-white border border-[var(--line)] text-[var(--body)] hover:border-[var(--main)]")}
                  >{slot}</button>
                ))}
              </div>
            </section>
          )}
        </div>
        <div>
          <DateCalendar date={date} onDateChange={onDateChange} />
        </div>
      </div>

      {/* ── Mobile: single column ── */}
      <div className="md:hidden space-y-0">
        <section>
          <Eyebrow>Type de réservation</Eyebrow>
          <TypeCards bookingType={bookingType} onTypeChange={onTypeChange} iconSize={17} />
        </section>
        <section className={sep}>
          <Eyebrow>Date</Eyebrow>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {dateChips.map(({ label, value }) => (
              <button key={value} type="button" onClick={() => onDateChange(value)}
                className={cn("shrink-0 rounded-full px-4 py-2 font-mono text-[12px] whitespace-nowrap cursor-pointer transition-all duration-150",
                  date === value
                    ? "bg-[var(--btn)] text-[var(--body)] border-0"
                    : "bg-white border border-[var(--line)] text-[var(--body)]")}
              >{label}</button>
            ))}
          </div>
        </section>
        {bookingType === "hourly" && (
          <section className={sep}>
            <Eyebrow>Heure de début</Eyebrow>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button key={slot} type="button" onClick={() => onTimeChange(slot)}
                  className={cn("px-3 py-2 rounded-[8px] font-mono text-[13px] cursor-pointer transition-all duration-150",
                    startTime === slot
                      ? "bg-[var(--body)] text-white"
                      : "bg-[rgba(65,121,114,0.08)] text-[var(--main)] hover:bg-[var(--main)] hover:text-white")}
                >{slot}</button>
              ))}
            </div>
          </section>
        )}
        <section className={sep}>
          <Eyebrow>Participants</Eyebrow>
          <PeopleStepper people={people} maxPeople={maxPeople} onPeopleChange={onPeopleChange} />
        </section>
      </div>
    </div>
  )
}
