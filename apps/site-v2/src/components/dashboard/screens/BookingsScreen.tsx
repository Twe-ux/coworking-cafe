"use client"
import { useState } from "react"
import { Icon } from "@/components/ui/Icon"
import { MOCK_UPCOMING, MOCK_PAST, SPACE_COLORS } from "@/types/dashboard"
import type { DashboardBooking, BookingStatus } from "@/types/dashboard"

const STATUS_LABELS: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmée',   color: 'var(--main)',    bg: 'rgba(65,121,114,0.1)' },
  pending:   { label: 'En attente',  color: 'var(--btn-dark)', bg: 'rgba(242,211,129,0.2)' },
  cancelled: { label: 'Annulée',     color: 'var(--danger)',  bg: 'rgba(192,83,76,0.1)' },
  completed: { label: 'Passée',      color: 'var(--gry)',     bg: 'rgba(122,118,107,0.08)' },
}

function DateBadge({ day, month, sp }: { day: string; month: string; sp: { color: string; bg: string } }) {
  return (
    <div style={{
      width: 48, borderRadius: 12, alignSelf: 'stretch',
      background: sp.bg,
      border: `1px solid ${sp.color}33`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 1, flexShrink: 0,
    }}>
      <span className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: sp.color, lineHeight: 1 }}>
        {day}
      </span>
      <span className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: sp.color, opacity: 0.8, letterSpacing: '0.08em' }}>
        {month}
      </span>
    </div>
  )
}

function BookingRow({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey]
  const st = STATUS_LABELS[booking.status]
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid var(--line)', padding: '16px',
      display: 'flex', alignItems: 'stretch', gap: 14,
    }}>
      <DateBadge day={booking.day} month={booking.month} sp={sp} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: sp.bg, color: sp.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {sp.label}
          </span>
          <span className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>
          {booking.space}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="calendar" size={12} stroke="var(--gry)" />
            {booking.dateLabel}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="clock" size={12} stroke="var(--gry)" />
            {booking.time}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="people" size={12} stroke="var(--gry)" />
            {booking.people}
          </span>
        </div>
      </div>
      <span className="font-serif" style={{ fontSize: 20, color: 'var(--body)', whiteSpace: 'nowrap' }}>
        {booking.price}€
      </span>
    </div>
  )
}

export function BookingsScreen() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const bookings = tab === 'upcoming' ? MOCK_UPCOMING : MOCK_PAST

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 16, paddingRight: 16, paddingBottom: 24, background: 'var(--cream)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="font-serif" style={{ fontSize: 26, color: 'var(--body)', margin: 0 }}>
          Réservations
        </h1>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(65,121,114,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bell" size={17} stroke="var(--body)" />
        </button>
      </div>

      {/* Segmented control */}
      <div style={{ display: 'flex', background: 'rgba(65,121,114,0.08)', borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="font-sans"
            style={{
              flex: 1, padding: '8px', borderRadius: 9,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--main)' : 'var(--gry)',
              boxShadow: tab === t ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {t === 'upcoming' ? 'À venir' : 'Passées'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {bookings.map((b) => (
          <BookingRow key={b.id} booking={b} />
        ))}
        {bookings.length === 0 && (
          <p className="font-sans" style={{ textAlign: 'center', color: 'var(--gry)', fontSize: 14, paddingTop: 40 }}>
            Aucune réservation
          </p>
        )}
      </div>
    </div>
  )
}
