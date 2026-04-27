import { Icon } from "@/components/ui/Icon";
import type { BookingStatus, DashboardBooking } from "@/types/dashboard";
import { SPACE_COLORS } from "@/types/dashboard";

const STATUS_LABELS: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: "Confirmée",  color: "var(--main)",     bg: "rgba(65,121,114,0.1)"   },
  pending:   { label: "En attente", color: "var(--btn-dark)", bg: "rgba(242,211,129,0.2)"  },
  cancelled: { label: "Annulée",    color: "var(--danger)",   bg: "rgba(192,83,76,0.1)"    },
  completed: { label: "Passée",     color: "var(--gry)",      bg: "rgba(122,118,107,0.08)" },
};

function DateBadge({ day, month, sp }: { day: string; month: string; sp: { color: string; bg: string } }) {
  return (
    <div
      style={{
        width: 48,
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
      <span className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: sp.color, lineHeight: 1 }}>
        {day}
      </span>
      <span className="font-mono" style={{ fontSize: 9, textTransform: "uppercase", color: sp.color, opacity: 0.8, letterSpacing: "0.08em" }}>
        {month}
      </span>
    </div>
  );
}

export function BookingRow({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey];
  const st = STATUS_LABELS[booking.status];

  return (
    <div style={{ background: "var(--white)", borderRadius: 16, border: "1px solid var(--line)", padding: "16px", display: "flex", alignItems: "stretch", gap: 14 }}>
      <DateBadge day={booking.day} month={booking.month} sp={sp} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: sp.bg, color: sp.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {sp.label}
          </span>
          <span className="font-mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: "var(--body)" }}>
          {booking.space}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          {[
            { icon: "calendar", value: booking.dateLabel },
            { icon: "clock",    value: booking.time      },
            { icon: "people",   value: booking.people    },
          ].map(({ icon, value }) => (
            <span key={icon} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--gry)" }}>
              <Icon name={icon} size={12} stroke="var(--gry)" />
              {value}
            </span>
          ))}
        </div>
      </div>
      <span className="font-serif" style={{ fontSize: 20, color: "var(--body)", whiteSpace: "nowrap" }}>
        {booking.price}€
      </span>
    </div>
  );
}
