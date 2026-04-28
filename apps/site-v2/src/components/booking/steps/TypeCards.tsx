"use client"

import { cn } from "@/lib/cn"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/Icon"
import type { BookingType } from "@/types/booking"
import { TYPE_LABELS } from "@/types/booking"

const BOOKING_TYPES: BookingType[] = ["hourly", "daily", "weekly", "monthly"]

export const TYPE_ICONS: Record<BookingType, IconName> = {
  hourly: "clock",
  daily: "sparkle",
  weekly: "calendar",
  monthly: "building",
}

interface TypeCardsProps {
  bookingType: BookingType
  onTypeChange: (t: BookingType) => void
  iconSize: number
}

export function TypeCards({ bookingType, onTypeChange, iconSize }: TypeCardsProps) {
  return (
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
              "flex flex-col gap-[6px] p-4 rounded-[12px] text-left cursor-pointer transition-all duration-150",
              active ? "bg-[var(--main)] border-0 text-white" : "bg-white border border-[var(--line)] text-[var(--body)]"
            )}
          >
            <Icon name={TYPE_ICONS[type]} size={iconSize} stroke={active ? "var(--btn)" : "var(--main)"} />
            <span className="font-sans text-[14px] font-medium">{label}</span>
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ opacity: active ? 0.75 : 0.6 }}
            >
              {sublabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}
