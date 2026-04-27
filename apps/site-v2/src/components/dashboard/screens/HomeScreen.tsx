"use client"
import { Icon } from "@/components/ui/Icon"
import { MOCK_UPCOMING, MOCK_STATS, MOCK_USER, SPACE_COLORS } from "@/types/dashboard"
import type { DashboardSection, DashboardBooking } from "@/types/dashboard"
import { DesktopHomeScreen } from "./DesktopHomeScreen"
import { HomeHero } from "./HomeHero"
import { HomeActions } from "./HomeActions"

interface HomeScreenProps {
  onNavigate: (section: DashboardSection) => void
}

function BookingMiniCard({ booking }: { booking: DashboardBooking }) {
  const sp = SPACE_COLORS[booking.spaceKey]
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid var(--line)', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {/* Date badge */}
      <div style={{
        width: 46, borderRadius: 12, alignSelf: 'stretch',
        background: sp.bg, border: `1px solid ${sp.color}33`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1, flexShrink: 0,
      }}>
        <span className="font-serif" style={{ fontSize: 20, fontWeight: 500, color: sp.color, lineHeight: 1 }}>{booking.day}</span>
        <span className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: sp.color, opacity: 0.8, letterSpacing: '0.08em' }}>{booking.month}</span>
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: sp.bg, color: sp.color, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: 4 }}>
          {sp.label}
        </div>
        <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>{booking.space}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="clock" size={11} stroke="var(--gry)" />{booking.time}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gry)' }}>
            <Icon name="people" size={11} stroke="var(--gry)" />{booking.people}
          </span>
        </div>
      </div>
      <span className="font-serif" style={{ fontSize: 18, color: 'var(--body)', whiteSpace: 'nowrap' }}>{booking.price}€</span>
    </div>
  )
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ minHeight: '100%' }}>
        <DesktopHomeScreen onNavigate={onNavigate} />
      </div>

      {/* Mobile */}
      <div className="md:hidden" style={{ paddingBottom: 24 }}>
        <HomeHero
          booking={MOCK_UPCOMING[0] ?? null}
          user={MOCK_USER}
          onNavigate={onNavigate}
        />

        <HomeActions stats={MOCK_STATS} onNavigate={onNavigate} />

        {/* Prochaines réservations */}
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--gry)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Prochaines · {MOCK_UPCOMING.length}
            </span>
            <button
              onClick={() => onNavigate('reservations')}
              className="font-mono"
              style={{ fontSize: 11, color: 'var(--main)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Tout voir →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_UPCOMING.map((b) => <BookingMiniCard key={b.id} booking={b} />)}
          </div>
        </div>
      </div>
    </>
  )
}
