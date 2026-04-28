import { Icon } from "@/components/ui/Icon";
import type { DashboardBooking, DashboardSection } from "@/types/dashboard";

interface HeroBookingCardProps {
  booking: DashboardBooking;
  onNavigate: (section: DashboardSection) => void;
}

export function HeroBookingCard({ booking, onNavigate }: HeroBookingCardProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 22,
        padding: 18,
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => onNavigate("reservations")}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              color: "var(--btn)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Prochaine réservation
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--btn)",
              marginLeft: 6,
              display: "inline-block",
            }}
          />
        </div>
        <span
          className="font-mono"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "var(--btn)",
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 99,
          }}
        >
          ✓ Validée
        </span>
        <Icon name="chevRight" size={16} stroke="rgba(255,255,255,0.5)" />
      </div>

      {/* Space name */}
      <div
        className="font-serif"
        style={{ fontSize: 21, color: "#fff", marginBottom: 10 }}
      >
        {booking.space}
      </div>

      {/* Details row */}
      <div style={{ display: "flex", gap: 16 }}>
        {(
          [
            { icon: "calendar", value: booking.dateLabel },
            { icon: "clock", value: booking.time },
            { icon: "people", value: booking.people },
          ] as const
        ).map(({ icon, value }) => (
          <span
            key={icon}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <Icon name={icon} size={13} stroke="var(--btn)" />
            {value}
          </span>
        ))}
      </div>

      {/* Footer row */}
      {/* <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
        }}
      >
        <span
          className="font-mono"
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "var(--btn)",
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 99,
          }}
        >
          ✓ Validée
        </span>
        <button
          className="font-mono"
          style={{
            background: "var(--btn)",
            color: "var(--body)",
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 12px",
            borderRadius: 99,
            border: "none",
            cursor: "pointer",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          QR check-in
        </button>
      </div> */}
    </div>
  );
}
