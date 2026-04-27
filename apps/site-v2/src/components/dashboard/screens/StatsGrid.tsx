import { Icon } from "@/components/ui/Icon";

interface StatsGridProps {
  active: number;
  hoursBooked: number;
  savings: number;
}

export function StatsGrid({ active, hoursBooked, savings }: StatsGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 16px 0" }}>
      <div style={{ background: "var(--white)", borderRadius: 16, padding: 14, border: "1px solid var(--line)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(65,121,114,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="calendar" size={16} stroke="var(--main)" />
        </div>
        <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1, marginTop: 8 }}>
          {active}
        </div>
        <div className="font-sans" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
          réservations actives
        </div>
      </div>

      <div style={{ background: "var(--white)", borderRadius: 16, padding: 14, border: "1px solid var(--line)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(242,211,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="clock" size={16} stroke="var(--btn-dark)" />
        </div>
        <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1, marginTop: 8 }}>
          {hoursBooked}h
        </div>
        <div className="font-sans" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
          heures réservées
        </div>
      </div>

      <div style={{ background: "var(--white)", borderRadius: 16, padding: 14, border: "1px solid var(--line)" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(76,160,110,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="checkCircle" size={16} stroke="var(--success)" />
        </div>
        <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1, marginTop: 8 }}>
          {savings}€
        </div>
        <div className="font-sans" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
          économisés
        </div>
      </div>
    </div>
  );
}
