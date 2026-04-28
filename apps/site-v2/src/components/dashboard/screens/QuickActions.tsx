"use client";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  active: number;
  completed: number;
  onNavigate: (section: DashboardSection) => void;
}

export function QuickActions({
  active,
  completed,
  onNavigate,
}: QuickActionsProps) {
  const router = useRouter();

  return (
    <div style={{ padding: "22px 20px 0" }}>
      {/* Section eyebrow */}
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "var(--gry)",
          marginBottom: 12,
        }}
      >
        Actions rapides
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Nouvelle réservation */}
        <div
          style={{
            background: "var(--btn)",
            borderRadius: 22,
            padding: 15,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            position: "relative",
            overflow: "hidden",
          }}
          onClick={() => router.push("/booking")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") router.push("/booking");
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              pointerEvents: "none",
            }}
          />
          <div className="flex  items-center gap-3">
            <Icon name="plus" size={22} stroke="var(--body)" sw={2} />
            <div
              className="font-serif"
              style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.2 }}
            >
              Nouvelle réservation
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(26,26,26,0.6)",
              }}
            >
              Open-space, salles, events
            </div>
          </div>
        </div>

        {/* Mes réservations */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 22,
            border: "1px solid var(--line)",
            padding: 15,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: 18,
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
                background: "rgba(65,121,114,0.1)",
                color: "var(--main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="calendar" size={20} stroke="var(--main)" />
            </div>
            <div
              className="font-serif"
              style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.2 }}
            >
              <p>Mes</p>
              <p>réservations</p>
            </div>
          </div>
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 15, color: "var(--gry)" }}
            >
              {active} actives
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 15, color: "var(--gry)" }}
            >
              {completed} passées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
