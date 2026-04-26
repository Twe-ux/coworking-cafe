"use client"
import { Icon } from "@/components/ui/Icon"
import { MOCK_UPCOMING, MOCK_STATS, MOCK_USER } from "@/types/dashboard"
import type { DashboardSection } from "@/types/dashboard"
import { DesktopStatCard } from "./DesktopStatCard"
import { DesktopBookingRow } from "./DesktopBookingRow"

interface DesktopHomeScreenProps {
  onNavigate: (section: DashboardSection) => void
}

function firstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

const QUICK_ACTIONS: Array<{
  icon: Parameters<typeof Icon>[0]['name']
  label: string
  section: DashboardSection | null
}> = [
  { icon: 'calendar', label: 'Réserver',    section: null },
  { icon: 'tag',      label: 'Mon forfait', section: 'wallet' },
  { icon: 'sparkle',  label: 'Événements',  section: 'events' },
  { icon: 'people',   label: 'Annuaire',    section: 'directory' },
]

export function DesktopHomeScreen({ onNavigate }: DesktopHomeScreenProps) {
  const stats = MOCK_STATS
  const user = MOCK_USER
  const progressPct = Math.round((stats.memberPoints / stats.nextReward) * 100)

  return (
    <div style={{ padding: '40px', background: 'var(--cream)', minHeight: '100%' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-serif" style={{ fontSize: 36, color: 'var(--body)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Bonjour, <em style={{ fontStyle: 'italic', color: 'var(--main)' }}>{firstName(user.name)}</em>
        </h1>
        <p className="font-sans" style={{ fontSize: 14, color: 'var(--gry)', margin: 0 }}>
          Votre espace de travail pour aujourd'hui
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <DesktopStatCard value={stats.active}            label="Résas actives" />
        <DesktopStatCard value={`${stats.hoursBooked}h`} label="Heures réservées" />
        <DesktopStatCard value={`${stats.savings}€`}     label="Économies" />
        <DesktopStatCard value={stats.memberPoints}      label="Points fidélité" />
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left: upcoming bookings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h2 className="font-serif" style={{ fontSize: 22, color: 'var(--body)', margin: 0 }}>
              Prochaines réservations
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
              <DesktopBookingRow key={b.id} booking={b} />
            ))}
          </div>
        </div>

        {/* Right: loyalty + quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Loyalty card */}
          <div style={{ background: 'var(--body)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(242,211,129,0.08)', pointerEvents: 'none' }} />
            <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--btn)', textTransform: 'uppercase', marginBottom: 8 }}>
              Fidélité
            </div>
            <div className="font-serif" style={{ fontSize: 48, color: 'var(--btn)', lineHeight: 1 }}>
              {stats.memberPoints} <span style={{ fontSize: 18, opacity: 0.6 }}>pts</span>
            </div>
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.1)', height: 4, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--btn)', borderRadius: 2 }} />
            </div>
            <div className="font-mono" style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              Prochain palier : {stats.nextReward} pts
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => action.section ? onNavigate(action.section) : undefined}
                style={{
                  background: '#fff', border: '1px solid var(--line)',
                  borderRadius: 16, padding: 20,
                  cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 10,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(65,121,114,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={action.icon} size={16} stroke="var(--main)" />
                </div>
                <span className="font-sans" style={{ fontSize: 12.5, color: 'var(--body)', fontWeight: 500 }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
