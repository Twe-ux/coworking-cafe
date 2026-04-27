"use client"

import { Icon } from "@/components/ui/Icon"
import type { DashboardBooking, DashboardSection, DashboardUser } from "@/types/dashboard"

interface HomeHeroProps {
  booking: DashboardBooking | null
  user: DashboardUser
  onNavigate: (section: DashboardSection) => void
}

function firstName(name: string): string {
  return name.split(' ')[0] ?? name
}

export function HomeHero({ booking, user, onNavigate }: HomeHeroProps) {
  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, var(--main) 0%, #2F5955 60%, var(--body) 100%)',
        borderRadius: '0 0 34px 34px',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 22,
        paddingRight: 22,
        paddingBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Décors absolus */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(242,211,129,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -50, left: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      {/* Topbar row */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: 24, position: 'relative',
        }}
      >
        <div>
          <div
            className="font-mono"
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4,
            }}
          >
            {todayLabel}
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
            position: 'relative', width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          aria-label="Notifications"
        >
          <Icon name="bell" size={17} stroke="#fff" />
          <span
            style={{
              position: 'absolute', top: 9, right: 9,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--btn)', border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          />
        </button>
      </div>

      {/* Card prochaine résa */}
      {booking && (
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 22, padding: 18,
            cursor: 'pointer', position: 'relative',
          }}
          onClick={() => onNavigate('reservations')}
        >
          {/* Card header */}
          <div
            style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: 11, color: 'var(--btn)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}
              >
                Prochaine réservation
              </span>
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--btn)', marginLeft: 6, display: 'inline-block',
                }}
              />
            </div>
            <Icon name="chevRight" size={16} stroke="rgba(255,255,255,0.5)" />
          </div>

          {/* Space name */}
          <div className="font-serif" style={{ fontSize: 21, color: '#fff', marginBottom: 10 }}>
            {booking.space}
          </div>

          {/* Details row */}
          <div style={{ display: 'flex', gap: 16 }}>
            {([
              { icon: 'calendar', value: booking.dateLabel },
              { icon: 'clock',    value: booking.time },
              { icon: 'people',   value: booking.people },
            ] as const).map(({ icon, value }) => (
              <span key={icon} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                <Icon name={icon} size={13} stroke="var(--btn)" />
                {value}
              </span>
            ))}
          </div>

          {/* Footer row */}
          <div
            style={{
              marginTop: 14, display: 'flex',
              justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span
              className="font-mono"
              style={{
                background: 'rgba(255,255,255,0.1)', color: 'var(--btn)',
                fontSize: 11, padding: '5px 10px', borderRadius: 99,
              }}
            >
              ✓ Validée · Payée
            </span>
            <button
              className="font-mono"
              style={{
                background: 'var(--btn)', color: 'var(--body)',
                fontSize: 12, fontWeight: 500,
                padding: '6px 12px', borderRadius: 99,
                border: 'none', cursor: 'pointer',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              QR check-in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
