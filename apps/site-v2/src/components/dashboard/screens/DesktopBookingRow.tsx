import { Icon } from "@/components/ui/Icon"
import { SPACE_COLORS } from "@/types/dashboard"
import type { DashboardBooking, BookingStatus } from "@/types/dashboard"

const STATUS_LABELS: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmée',   color: 'var(--main)',    bg: 'rgba(65,121,114,0.1)' },
  pending:   { label: 'En attente',  color: 'var(--btn-dark)', bg: 'rgba(242,211,129,0.2)' },
  cancelled: { label: 'Annulée',     color: 'var(--danger)',  bg: 'rgba(192,83,76,0.1)' },
  completed: { label: 'Passée',      color: 'var(--gry)',     bg: 'rgba(122,118,107,0.08)' },
}

interface DesktopBookingRowProps {
  booking: DashboardBooking
}

export function DesktopBookingRow({ booking }: DesktopBookingRowProps) {
  const sp = SPACE_COLORS[booking.spaceKey]
  const st = STATUS_LABELS[booking.status]
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 16,
      background: '#fff', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 20px',
    }}>
      {/* Date badge */}
      <div style={{
        width: 56, borderRadius: 12, alignSelf: 'stretch',
        background: sp.hex,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '10px 4px', flexShrink: 0,
      }}>
        {booking.weekday && (
          <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: '#fff', opacity: 0.85, textTransform: 'uppercase' }}>
            {booking.weekday}
          </span>
        )}
        <span className="font-serif" style={{ fontSize: 22, lineHeight: 1, margin: '2px 0', color: '#fff' }}>
          {booking.day}
        </span>
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.12em', color: '#fff', opacity: 0.85, textTransform: 'uppercase' }}>
          {booking.month}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)', marginBottom: 4 }}>
          {booking.space}
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="clock" size={11} stroke="var(--gry)" />
            {booking.time}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="people" size={11} stroke="var(--gry)" />
            {booking.people}
          </span>
        </div>
      </div>

      {/* Price + status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <span className="font-serif" style={{ fontSize: 18, color: 'var(--body)' }}>
          {booking.price}€
        </span>
        <span className="font-mono" style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 99,
          background: st.bg, color: st.color,
        }}>
          {st.label}
        </span>
      </div>
    </div>
  )
}
