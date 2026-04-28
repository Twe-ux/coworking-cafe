"use client";

import { Icon } from "@/components/ui/Icon";
import type {
  DashboardBooking,
  DashboardSection,
  DashboardUser,
} from "@/types/dashboard";
import { HeroBookingCard } from "./HeroBookingCard";

interface HomeHeroProps {
  booking: DashboardBooking | null;
  user: DashboardUser;
  onNavigate: (section: DashboardSection) => void;
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function HomeHero({ booking, user, onNavigate }: HomeHeroProps) {
  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className="rounded-[34px] standalone:rounded-t-[50px] mx-1.25"
      style={{
        background:
          "linear-gradient(160deg, var(--main) 0%, #2F5955 60%, var(--body) 100%)",
        /* max() ensures at least 16px top padding in browser devtools (env = 0) */
        paddingTop: "max(env(safe-area-inset-top, 0px), 16px)",
        paddingLeft: 22,
        paddingRight: 22,
        paddingBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Décors absolus */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(242,211,129,0.1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      {/* Topbar row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          position: "relative",
        }}
      >
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 4,
            }}
          >
            {todayLabel}
          </div>
          <div
            className="font-serif"
            style={{ fontSize: 28, color: "#fff", lineHeight: 1.1 }}
          >
            Bonjour,{" "}
            <em style={{ fontStyle: "italic", color: "var(--btn)" }}>
              {firstName(user.name)}
            </em>
          </div>
        </div>

        <button
          style={{
            position: "relative",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Notifications"
        >
          <Icon name="bell" size={17} stroke="#fff" />
          <span
            style={{
              position: "absolute",
              top: 9,
              right: 9,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--btn)",
              border: "1.5px solid rgba(255,255,255,0.3)",
            }}
          />
        </button>
      </div>

      {/* Card prochaine résa */}
      {booking && <HeroBookingCard booking={booking} onNavigate={onNavigate} />}
    </div>
  );
}
