"use client";
import { Icon } from "@/components/ui/Icon";
import { MOCK_PAST, MOCK_UPCOMING } from "@/types/dashboard";
import { useState } from "react";
import { BookingRow } from "./BookingRow";

export function BookingsScreen() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const bookings = tab === "upcoming" ? MOCK_UPCOMING : MOCK_PAST;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          paddingTop: "env(safe-area-inset-top)",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 14,
          background: "var(--cream)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 16 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: 0 }}>
            Réservations
          </h1>
          <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(65,121,114,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bell" size={17} stroke="var(--body)" />
          </button>
        </div>

        {/* Segmented control */}
        <div style={{ display: "flex", background: "rgba(65,121,114,0.08)", borderRadius: 12, padding: 4 }}>
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-sans"
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                background: tab === t ? "var(--white)" : "transparent",
                color: tab === t ? "var(--main)" : "var(--gry)",
                boxShadow: tab === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.2s",
              }}
            >
              {t === "upcoming" ? "À venir" : "Passées"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 24, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
          {bookings.length === 0 && (
            <p className="font-sans" style={{ textAlign: "center", color: "var(--gry)", fontSize: 14, paddingTop: 40 }}>
              Aucune réservation
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
