"use client";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection, DashboardStats } from "@/types/dashboard";

interface HomeActionsProps {
  stats: DashboardStats;
  onNavigate: (section: DashboardSection) => void;
}

export function HomeActions({ stats, onNavigate }: HomeActionsProps) {
  const progressPct = Math.min(
    (stats.memberPoints / stats.nextReward) * 100,
    100,
  );
  const ptsRemaining = stats.nextReward - stats.memberPoints;

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Section 1 — Quick Actions */}
      <div style={{ padding: "16px 16px 0", marginTop: 16 }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {/* Card 1 — Nouvelle réservation */}
          <div
            style={{
              background: "var(--btn)",
              borderRadius: 18,
              padding: 10,
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/booking";
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") window.location.href = "/booking";
            }}
          >
            <div className="flex items-center gap-3 ">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="plus" size={22} stroke="var(--body)" sw={2} />
              </div>
              <div
                className="font-serif  w-20"
                style={{ fontSize: 16, color: "var(--body)" }}
              >
                Nouvelle réservation
              </div>
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", marginTop: 4 }}
            >
              Open-space, salles, events
            </div>
          </div>

          {/* Card 2 — Mes réservations */}
          <div
            style={{
              background: "#fff",
              // border: "1px solid var(--line)",
              borderRadius: 18,
              padding: 10,
              cursor: "pointer",
            }}
            onClick={() => onNavigate("reservations")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") onNavigate("reservations");
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(65,121,114,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="calendar" size={18} stroke="var(--main)" />
              </div>
              <div
                className="font-serif"
                style={{ fontSize: 16, color: "var(--body)" }}
              >
                <p>Mes</p>
                <p>réservations</p>
              </div>
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}
            >
              {stats.active} actives · {stats.hoursBooked}h
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 — Loyalty card */}
      <div
        style={{
          margin: "12px 16px 0",
          background: "var(--body)",
          borderRadius: 22,
          padding: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Overlay décoratif */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(65,121,114,0.25), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Contenu */}
        <div style={{ position: "relative" }}>
          {/* Tag row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="sparkle" size={14} stroke="var(--btn)" />
            <span
              className="font-mono"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Programme fidélité
            </span>
          </div>

          {/* Points */}
          <div
            className="font-serif"
            style={{
              fontSize: 38,
              color: "var(--btn)",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {stats.memberPoints}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              marginTop: 4,
            }}
          >
            points de fidélité
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: 16,
              background: "rgba(255,255,255,0.1)",
              height: 6,
              borderRadius: 3,
            }}
          >
            <div
              style={{
                background: "var(--btn)",
                height: 6,
                borderRadius: 3,
                width: `${progressPct}%`,
              }}
            />
          </div>

          {/* Helper */}
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              marginTop: 8,
            }}
          >
            Prochaine récompense: boisson offerte · {ptsRemaining} pts
          </div>
        </div>
      </div>

      {/* Section 3 — Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          padding: "12px 16px 0",
        }}
      >
        {/* Active */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 14,
            border: "1px solid var(--line)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(65,121,114,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={16} stroke="var(--main)" />
          </div>
          <div
            className="font-serif"
            style={{
              fontSize: 28,
              color: "var(--body)",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {stats.active}
          </div>
          <div
            className="font-sans"
            style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}
          >
            réservations actives
          </div>
        </div>

        {/* Hours booked */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 14,
            border: "1px solid var(--line)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(242,211,129,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="clock" size={16} stroke="var(--btn-dark)" />
          </div>
          <div
            className="font-serif"
            style={{
              fontSize: 28,
              color: "var(--body)",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {stats.hoursBooked}h
          </div>
          <div
            className="font-sans"
            style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}
          >
            heures réservées
          </div>
        </div>

        {/* Savings */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 14,
            border: "1px solid var(--line)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(76,160,110,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="checkCircle" size={16} stroke="#4CA06E" />
          </div>
          <div
            className="font-serif"
            style={{
              fontSize: 28,
              color: "var(--body)",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {stats.savings}€
          </div>
          <div
            className="font-sans"
            style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}
          >
            économisés
          </div>
        </div>
      </div>

      {/* Section 4 — Promo carousel */}
      <div style={{ marginTop: 12, paddingBottom: 4 }}>
        <div
          style={{
            padding: "0 16px",
            overflowX: "auto",
            scrollbarWidth: "none" as const,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              width: "fit-content",
              paddingBottom: 4,
            }}
          >
            {/* Promo 1 — Happy Hour */}
            <div
              style={{
                flexShrink: 0,
                width: 200,
                borderRadius: 18,
                padding: 16,
                background: "var(--btn)",
              }}
            >
              <Icon name="tag" size={20} stroke="var(--body)" />
              <div
                className="font-serif"
                style={{
                  fontSize: 18,
                  color: "var(--body)",
                  marginTop: 10,
                  lineHeight: 1.1,
                }}
              >
                Happy Hour
              </div>
              <div
                className="font-sans"
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.6)",
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                -20% sur les open-space après 17h
              </div>
            </div>

            {/* Promo 2 — Privatisation weekend */}
            <div
              style={{
                flexShrink: 0,
                width: 200,
                borderRadius: 18,
                padding: 16,
                background: "#5A938B",
              }}
            >
              <Icon name="tag" size={20} stroke="#fff" />
              <div
                className="font-serif"
                style={{
                  fontSize: 18,
                  color: "#fff",
                  marginTop: 10,
                  lineHeight: 1.1,
                }}
              >
                Privatisation weekend
              </div>
              <div
                className="font-sans"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                Tarif dégressif dès 4h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
