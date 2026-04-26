"use client"
import { Icon } from "@/components/ui/Icon"
import { MOCK_UPCOMING, MOCK_STATS, MOCK_USER, SPACE_COLORS } from "@/types/dashboard"
import type { DashboardSection, DashboardBooking } from "@/types/dashboard"
import { DesktopHomeScreen } from "./DesktopHomeScreen"

interface HomeScreenProps {
  onNavigate: (section: DashboardSection) => void
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

function todayLabel(): string {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function BookingMiniCard({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey]
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid var(--line)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: sp.bg, color: sp.color,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            {sp.label}
          </span>
        </div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>
          {booking.space}
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>
          {booking.dateLabel} · {booking.time}
        </div>
      </div>
      <span className="font-serif" style={{ fontSize: 18, color: 'var(--body)', whiteSpace: 'nowrap' }}>
        {booking.price}€
      </span>
    </div>
  )
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const next = MOCK_UPCOMING[0]
  const stats = MOCK_STATS
  const user = MOCK_USER

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:block" style={{ minHeight: '100%' }}>
        <DesktopHomeScreen onNavigate={onNavigate} />
      </div>

      {/* Mobile layout — unchanged */}
      <div className="md:hidden" style={{ paddingBottom: 24 }}>
      {/* Hero dark */}
      <div
        style={{
          background: 'linear-gradient(160deg, var(--main) 0%, var(--main-dark) 60%, var(--body) 100%)',
          borderRadius: '0 0 34px 34px',
          padding: '60px 22px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Décors */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(242,211,129,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Topbar hero */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative' }}>
          <div>
            <div className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
              {todayLabel()}
            </div>
            <div className="font-serif" style={{ fontSize: 28, color: '#fff', lineHeight: 1.1 }}>
              Bonjour,{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--btn)' }}>
                {firstName(user.name)}
              </em>
            </div>
          </div>
          <button
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="bell" size={17} stroke="#fff" />
          </button>
        </div>

        {/* Card prochaine résa */}
        {next && (
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              padding: 18,
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={() => onNavigate('reservations')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--btn)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Prochaine réservation
              </span>
              <Icon name="chevRight" size={16} stroke="rgba(255,255,255,0.5)" />
            </div>
            <div className="font-serif" style={{ fontSize: 21, color: '#fff', marginBottom: 10 }}>
              {next.space}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                <Icon name="calendar" size={13} stroke="var(--btn)" />
                {next.dateLabel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                <Icon name="clock" size={13} stroke="var(--btn)" />
                {next.time}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenu cream */}
      <div style={{ padding: '22px 16px' }}>
        {/* Stats */}
        <p className="font-mono" style={{ fontSize: 11, color: 'var(--gry)', marginBottom: 24 }}>
          {stats.hoursBooked}h réservées · {stats.savings}€ économisés · {stats.memberPoints} pts fidélité
        </p>

        {/* Prochaines réservations */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="font-serif" style={{ fontSize: 20, color: 'var(--body)', margin: 0 }}>
            Réservations
          </h2>
          <button
            onClick={() => onNavigate('reservations')}
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--main)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Tout voir
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_UPCOMING.slice(0, 3).map((b) => (
            <BookingMiniCard key={b.id} booking={b} />
          ))}
        </div>
      </div>
    </div>
    </>
  )
}
