"use client"

import type { Venue } from "@/types/venue"

interface VenueSelectorProps {
  venues: Venue[]
  selectedVenueId: string | null
  onSelect: (venueId: string) => void
}

export function VenueSelector({ venues, selectedVenueId, onSelect }: VenueSelectorProps) {
  if (venues.length < 2) return null

  return (
    <div>
      <h2 className="font-serif" style={{ fontSize: 28, color: "var(--body)" }}>
        Où souhaitez-vous travailler ?
      </h2>
      <p className="font-sans" style={{ fontSize: 14, color: "var(--gry)", marginBottom: 24, marginTop: 6 }}>
        Choisissez votre espace
      </p>

      <div className="flex flex-col" style={{ gap: 12 }}>
        {venues.map((venue) => {
          const isSelected = venue.id === selectedVenueId

          return (
            <button
              key={venue.id}
              onClick={() => onSelect(venue.id)}
              className="text-left transition-all"
              style={{
                background: isSelected ? "rgba(65,121,114,0.04)" : "white",
                border: `${isSelected ? "2px" : "1.5px"} solid ${isSelected ? "var(--main)" : "var(--line)"}`,
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Radio indicator */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  border: isSelected ? "none" : "2px solid var(--line)",
                  background: isSelected ? "var(--main)" : "white",
                }}
              >
                {isSelected && (
                  <div
                    className="rounded-full"
                    style={{ width: 8, height: 8, background: "white" }}
                  />
                )}
              </div>

              {/* Content */}
              <div>
                <div className="font-serif" style={{ fontSize: 18, color: "var(--body)" }}>
                  {venue.name}
                </div>
                <div className="font-sans" style={{ fontSize: 13, color: "var(--gry)", marginTop: 2 }}>
                  {venue.address} — {venue.city}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
