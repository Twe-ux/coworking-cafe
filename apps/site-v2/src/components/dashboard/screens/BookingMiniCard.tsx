import { Icon } from "@/components/ui/Icon";
import type { DashboardBooking } from "@/types/dashboard";
import { SPACE_COLORS } from "@/types/dashboard";

export function BookingMiniCard({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey];

  return (
    <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--line)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
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
          gap: 1,
          flexShrink: 0,
        }}
      >
        <span className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: sp.color, lineHeight: 1 }}>
          {booking.day}
        </span>
        <span className="font-mono" style={{ fontSize: 9, textTransform: "uppercase", color: sp.color, opacity: 0.8, letterSpacing: "0.08em" }}>
          {booking.month}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sp.bg, color: sp.color, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-block", marginBottom: 4 }}>
          {sp.label}
        </div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: "var(--body)" }}>
          {booking.space}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--gry)" }}>
            <Icon name="clock" size={11} stroke="var(--gry)" />
            {booking.time}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--gry)" }}>
            <Icon name="people" size={11} stroke="var(--gry)" />
            {booking.people}
          </span>
        </div>
      </div>

      <span className="font-serif" style={{ fontSize: 18, color: "var(--body)", whiteSpace: "nowrap" }}>
        {booking.price}€
      </span>
    </div>
  );
}
