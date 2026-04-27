"use client";
import { Icon } from "@/components/ui/Icon";
import type { DashboardSection } from "@/types/dashboard";
import { useRouter } from "next/navigation";

interface QuickActionsProps {
  active: number;
  hoursBooked: number;
  onNavigate: (section: DashboardSection) => void;
}

export function QuickActions({ active, hoursBooked, onNavigate }: QuickActionsProps) {
  const router = useRouter();

  return (
    <div style={{ padding: "16px 16px 0", marginTop: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Nouvelle réservation */}
        <div
          style={{ background: "var(--btn)", borderRadius: 18, padding: 10, cursor: "pointer" }}
          onClick={() => router.push("/booking")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") router.push("/booking"); }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={22} stroke="var(--body)" sw={2} />
            </div>
            <div className="font-serif w-20" style={{ fontSize: 16, color: "var(--body)" }}>
              Nouvelle réservation
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", marginTop: 4 }}>
            Open-space, salles, events
          </div>
        </div>

        {/* Mes réservations */}
        <div
          style={{ background: "var(--white)", borderRadius: 18, padding: 10, cursor: "pointer" }}
          onClick={() => onNavigate("reservations")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") onNavigate("reservations"); }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(65,121,114,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="calendar" size={18} stroke="var(--main)" />
            </div>
            <div className="font-serif" style={{ fontSize: 16, color: "var(--body)" }}>
              <p>Mes</p>
              <p>réservations</p>
            </div>
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
            {active} actives · {hoursBooked}h
          </div>
        </div>
      </div>
    </div>
  );
}
