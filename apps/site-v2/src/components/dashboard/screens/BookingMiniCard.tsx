import { Icon } from "@/components/ui/Icon";
import type { DashboardBooking } from "@/types/dashboard";
import { SPACE_COLORS } from "@/types/dashboard";

interface StatusChipProps {
  status: DashboardBooking["status"];
}

function StatusChip({ status }: StatusChipProps) {
  const isConfirmed = status === "confirmed";
  const bg = isConfirmed ? "rgba(76,160,110,0.14)" : "rgba(214,138,60,0.14)";
  const color = isConfirmed ? "var(--success)" : "var(--warning)";
  const label = isConfirmed ? "Validée" : "En attente";

  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10,
        padding: "3px 8px",
        borderRadius: 999,
        background: bg,
        color,
        display: "inline-block",
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  );
}

export function BookingMiniCard({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey];

  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        border: "1px solid var(--line)",
        padding: 14,
        display: "flex",
        gap: 12,
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {/* Date badge */}
      <div
        style={{
          width: 46,
          borderRadius: 12,
          alignSelf: "stretch",
          background: sp.bg,
          border: `1px solid ${sp.color}33`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <span
          className="font-serif"
          style={{ fontSize: 18, fontWeight: 500, color: sp.color, lineHeight: 1 }}
        >
          {booking.day}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 9, textTransform: "uppercase", color: sp.color, opacity: 0.8, letterSpacing: "0.08em" }}
        >
          {booking.month}
        </span>
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="font-sans"
          style={{ fontSize: 15, fontWeight: 500, color: "var(--body)" }}
        >
          {booking.space}
        </div>
        <div
          style={{ fontSize: 12, color: "var(--gry)", marginTop: 2, display: "flex", gap: 8, alignItems: "center" }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="clock" size={11} stroke="var(--gry)" />
            {booking.time}
          </span>
          <span>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="people" size={11} stroke="var(--gry)" />
            {booking.people} pers.
          </span>
        </div>
      </div>

      {/* Right: status + price */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <StatusChip status={booking.status} />
        <span
          className="font-mono"
          style={{ fontSize: 14, color: "var(--body)" }}
        >
          {booking.price}€
        </span>
      </div>
    </div>
  );
}
