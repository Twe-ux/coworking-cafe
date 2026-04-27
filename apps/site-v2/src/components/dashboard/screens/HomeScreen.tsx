"use client";
import type { DashboardSection } from "@/types/dashboard";
import { MOCK_STATS, MOCK_UPCOMING, MOCK_USER } from "@/types/dashboard";
import { BookingMiniCard } from "./BookingMiniCard";
import { DesktopHomeScreen } from "./DesktopHomeScreen";
import { HomeActions } from "./HomeActions";
import { HomeHero } from "./HomeHero";

interface HomeScreenProps {
  onNavigate: (section: DashboardSection) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ minHeight: "100%" }}>
        <DesktopHomeScreen onNavigate={onNavigate} />
      </div>

      {/* Mobile — standalone: 24px bottom breathing room / browser: none (hamburger is fixed) */}
      <div className="md:hidden standalone:pb-6">
        <HomeHero
          booking={MOCK_UPCOMING[0] ?? null}
          user={MOCK_USER}
          onNavigate={onNavigate}
        />
        <HomeActions stats={MOCK_STATS} onNavigate={onNavigate} />

        {/* Prochaines réservations */}
        <div style={{ padding: "16px 16px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--gry)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Prochaines · {MOCK_UPCOMING.length}
            </span>
            <button
              onClick={() => onNavigate("reservations")}
              className="font-mono"
              style={{
                fontSize: 11,
                color: "var(--main)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Tout voir →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOCK_UPCOMING.map((b) => (
              <BookingMiniCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
