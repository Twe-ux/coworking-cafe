"use client"

import { cn } from "@/lib/cn"
import type { BookingType } from "@/types/booking"
import { DateCalendar } from "./DateCalendar"
import { TypeCards } from "./TypeCards"
import { TimeSlots, DurationRow, DailyCard, PeopleStepper } from "./Step2DateTimeParts"

interface Step2DateTimeProps {
  bookingType: BookingType
  date: string | null
  startTime: string | null
  endTime: string | null
  people: number
  maxPeople: number
  onTypeChange: (type: BookingType) => void
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  onPeopleChange: (n: number) => void
}

const ALL_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00","21:30","22:00",
]

function getEndSlots(startTime: string): string[] {
  const [sh, sm] = startTime.split(":").map(Number)
  const startMinutes = sh * 60 + sm
  return ALL_SLOTS.filter((slot) => {
    const [eh, em] = slot.split(":").map(Number)
    return eh * 60 + em > startMinutes + 29
  })
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>
}

// ── Main component ────────────────────────────────────────────────────────────
export function Step2DateTime({
  bookingType, date, startTime, endTime, people, maxPeople,
  onTypeChange, onDateChange, onTimeChange, onEndTimeChange, onPeopleChange,
}: Step2DateTimeProps) {
  const dateChips = buildDateChips()
  const endSlots = startTime ? getEndSlots(startTime) : []
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
            <>
              <section className={sep}>
                <Eyebrow>Heure d&apos;arrivée</Eyebrow>
                <TimeSlots slots={ALL_SLOTS} active={startTime} onSelect={onTimeChange} layout="grid" />
              </section>
              {startTime && (
                <section className={sep}>
                  <Eyebrow>Heure de départ</Eyebrow>
                  <TimeSlots slots={endSlots} active={endTime} onSelect={onEndTimeChange} layout="grid" />
                  {startTime && endTime && <DurationRow startTime={startTime} endTime={endTime} />}
                </section>
              )}
            </>
          )}
          {bookingType === "daily" && (
            <section className={sep}>
              <DailyCard />
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
          <>
            <section className={sep}>
              <Eyebrow>Heure d&apos;arrivée</Eyebrow>
              <TimeSlots slots={ALL_SLOTS} active={startTime} onSelect={onTimeChange} layout="scroll" />
            </section>
            {startTime && (
              <section className={sep}>
                <Eyebrow>Heure de départ</Eyebrow>
                <TimeSlots slots={endSlots} active={endTime} onSelect={onEndTimeChange} layout="scroll" />
                {endTime && <DurationRow startTime={startTime} endTime={endTime} />}
              </section>
            )}
          </>
        )}
        {bookingType === "daily" && (
          <section className={sep}>
            <DailyCard />
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
