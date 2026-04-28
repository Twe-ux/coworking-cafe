import { Icon } from "@/components/ui/Icon";

interface StatsGridProps {
  active: number;
  hoursBooked: number;
  completed: number;
}

export function StatsGrid({ active, hoursBooked, completed }: StatsGridProps) {
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
        Mes statistiques
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {/* Réservations actives */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(65,121,114,0.12)",
              color: "var(--main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="calendar" size={18} stroke="var(--main)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1 }}>
              {active}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
              Actives
            </div>
          </div>
        </div>

        {/* Heures réservées */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(242,211,129,0.22)",
              color: "var(--btn-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="clock" size={18} stroke="var(--btn-dark)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1 }}>
              {hoursBooked}
              <span style={{ fontSize: 14, color: "var(--gry)" }}>h</span>
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
              Réservées
            </div>
          </div>
        </div>

        {/* Complétées */}
        <div
          style={{
            background: "var(--white)",
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(76,160,110,0.14)",
              color: "var(--success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="checkCircle" size={18} stroke="var(--success)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 28, color: "var(--body)", lineHeight: 1 }}>
              {completed}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 4 }}>
              Complétées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
