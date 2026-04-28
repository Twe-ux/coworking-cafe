"use client"

import { cn } from "@/lib/cn"

interface DateCalendarProps {
  date: string | null
  onDateChange: (date: string) => void
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function DateCalendar({ date, onDateChange }: DateCalendarProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDay = today.getDate()

  // First weekday of the month (0=Sun → remap to Mon-first: Mon=0…Sun=6)
  const firstDow = new Date(year, month, 1).getDay()
  const offset = firstDow === 0 ? 6 : firstDow - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  return (
    <div>
      <div
        className="eyebrow mb-3 flex justify-between items-center"
      >
        <span>Date</span>
        <span className="font-mono text-[11px] text-[var(--main)] capitalize">{monthLabel}</span>
      </div>

      <div
        className="bg-white border border-[var(--line)] rounded-[16px] p-4"
      >
        {/* Header weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div
              key={i}
              className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--gry)] py-1"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Offset empty cells */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const value = toDateString(year, month, day)
            const active = date === value
            const isPast = day < todayDay
            const isToday = day === todayDay

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => onDateChange(value)}
                className={cn(
                  "aspect-square rounded-[10px] flex items-center justify-center relative",
                  "font-mono text-[13px] transition-all duration-150",
                  active && "bg-[var(--body)] text-white font-medium",
                  !active && isToday && "bg-[rgba(242,211,129,0.18)] border border-[var(--btn)] text-[var(--body)]",
                  !active && !isToday && !isPast && "text-[var(--body)] hover:bg-[rgba(65,121,114,0.08)] cursor-pointer",
                  isPast && "text-[rgba(110,111,117,0.35)] cursor-not-allowed"
                )}
              >
                {day}
                {active && (
                  <span className="absolute bottom-[4px] w-1 h-1 rounded-full bg-[var(--btn)]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div
          className="mt-3 pt-3 border-t border-[var(--line)] flex justify-between font-mono text-[11px] text-[var(--gry)]"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--btn)] inline-block" />
            Aujourd&apos;hui
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--body)] inline-block" />
            Sélection
          </span>
        </div>
      </div>
    </div>
  )
}
