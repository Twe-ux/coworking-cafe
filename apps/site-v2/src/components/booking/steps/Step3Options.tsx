"use client"

import { Icon } from "@/components/ui/Icon"
import { cn } from "@/lib/cn"
import type { BookingService } from "@/types/booking"

interface Step3OptionsProps {
  services: BookingService[]
  selectedServices: string[]
  specialRequest: string
  onToggleService: (serviceId: string) => void
  onSpecialRequestChange: (text: string) => void
}

// ─── Service card with checkbox ──────────────────────────────────────────────

interface ServiceToggleCardProps {
  service: BookingService
  isSelected: boolean
  onToggle: () => void
}

function ServiceToggleCard({ service, isSelected, onToggle }: ServiceToggleCardProps) {
  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onToggle()}
      className={cn(
        "flex items-center gap-3 cursor-pointer transition-colors",
        isSelected
          ? "border-[var(--main)] bg-[rgba(65,121,114,0.06)]"
          : "border-[var(--line)] bg-white",
      )}
      style={{ borderRadius: 12, padding: 16, border: "1.5px solid" }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "rgba(65,121,114,0.1)",
        }}
      >
        <Icon name={service.icon} size={16} stroke="var(--main)" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className="font-sans font-medium truncate" style={{ fontSize: 14, color: "var(--body)" }}>
          {service.label}
        </div>
        <div className="font-mono mt-0.5" style={{ fontSize: 12, color: "var(--gry)" }}>
          +{service.price}€
        </div>
      </div>

      {/* Checkbox */}
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          border: isSelected ? "none" : "1.5px solid var(--line)",
          background: isSelected ? "var(--main)" : "white",
        }}
      >
        {isSelected && <Icon name="check" size={10} stroke="white" sw={2.5} />}
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export function Step3Options({
  services,
  selectedServices,
  specialRequest,
  onToggleService,
  onSpecialRequestChange,
}: Step3OptionsProps) {
  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      {/* Services additionnels */}
      <section>
        <p className="eyebrow mb-3" style={{ color: "var(--gry)" }}>
          Services additionnels
        </p>
        <div
          className="grid sm:grid-cols-2"
          style={{ gap: 10 }}
        >
          {services.map((service) => (
            <ServiceToggleCard
              key={service.id}
              service={service}
              isSelected={selectedServices.includes(service.id)}
              onToggle={() => onToggleService(service.id)}
            />
          ))}
        </div>
      </section>

      {/* Demande spéciale */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <p className="eyebrow" style={{ color: "var(--gry)" }}>
            Demande spéciale
          </p>
          <span className="font-mono" style={{ fontSize: 11, color: "var(--gry)" }}>
            (optionnel)
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 6 }}>
          <textarea
            value={specialRequest}
            onChange={(e) => onSpecialRequestChange(e.target.value)}
            placeholder="Allergies, équipement spécifique, configuration salle..."
            rows={3}
            maxLength={300}
            className="w-full font-sans resize-y focus:outline-none transition-colors"
            style={{
              fontSize: 14,
              color: "var(--body)",
              border: "1.5px solid var(--line)",
              borderRadius: 12,
              padding: 14,
              background: "white",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--main)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
          />
          <p className="font-mono text-right" style={{ fontSize: 11, color: "var(--gry)" }}>
            {specialRequest.length}/300
          </p>
        </div>
      </section>
    </div>
  )
}
