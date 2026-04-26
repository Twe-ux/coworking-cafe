"use client"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { MOCK_UPCOMING, MOCK_USER } from "@/types/dashboard"
import type { DashboardSection } from "@/types/dashboard"
import { DesktopTopbar } from "./DesktopTopbar"
import { DesktopStatCard } from "./DesktopStatCard"
import { DesktopBookingRow } from "./DesktopBookingRow"
import { ActivityFeed } from "./ActivityFeed"
import { DesktopLoyaltyCard } from "./DesktopLoyaltyCard"
import { NextEventCard } from "./NextEventCard"

interface DesktopHomeScreenProps {
  onNavigate: (section: DashboardSection) => void
}

const QUICK_ACTIONS = [
  { icon: 'calendar' as const, label: 'Réserver un espace', href: '/booking' },
  { icon: 'receipt'  as const, label: 'Mes factures',       href: null       },
  { icon: 'people'   as const, label: 'Inviter un ami',     href: null       },
  { icon: 'help'     as const, label: 'Aide & support',     href: null       },
]

export function DesktopHomeScreen({ onNavigate }: DesktopHomeScreenProps) {
  const user = MOCK_USER
  const firstName = user.name.split(' ')[0] ?? user.name

  return (
    <div style={{ padding: 40, background: 'var(--cream)', minHeight: '100%' }}>
      <DesktopTopbar userName={firstName} />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <DesktopStatCard tag="Heures ce mois"  val="62"   unit="h"        delta="+12% vs avril"          deltaPos={true} />
        <DesktopStatCard tag="Crédit restant"  val="18"   unit="h"        delta="Renouvellement le 01/05" deltaPos={true} />
        <DesktopStatCard tag="Points fidélité" val="1 240"                delta="+180 ce mois"            deltaPos={true} />
        <DesktopStatCard tag="Événements"      val={2}    unit="inscrits" delta="Prochain le 06/05"       deltaPos={true} />
      </div>

      {/* 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Prochaines réservations */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: 'clamp(20px, 2.4vw, 30px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--gry)', textTransform: 'uppercase' }}>
                  — Prochaines réservations
                </div>
                <h2 className="font-serif" style={{ fontSize: 22, marginTop: 6, color: 'var(--body)', margin: '6px 0 0' }}>
                  Cette semaine
                </h2>
              </div>
              <button
                onClick={() => onNavigate('reservations')}
                className="font-mono"
                style={{ fontSize: 12.5, color: 'var(--main)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.12em' }}
              >
                Tout voir →
              </button>
            </div>
            {MOCK_UPCOMING.slice(0, 3).map((b) => (
              <DesktopBookingRow key={b.id} booking={b} />
            ))}
          </div>

          <ActivityFeed />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <DesktopLoyaltyCard points={1240} progressPct={82} />

          {/* Quick actions */}
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 22, padding: 'clamp(20px, 2.4vw, 30px)' }}>
            <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--gry)', textTransform: 'uppercase', marginBottom: 6 }}>
              — Raccourcis
            </div>
            <h3 className="font-serif" style={{ fontSize: 20, marginBottom: 16, color: 'var(--body)', margin: '0 0 16px' }}>
              Actions rapides
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {QUICK_ACTIONS.map((action) => {
                const inner = (
                  <div style={{ padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(65,121,114,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={action.icon} size={15} stroke="var(--main)" />
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--body)', fontWeight: 500 }}>
                      {action.label}
                    </div>
                  </div>
                )
                return action.href ? (
                  <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>{inner}</Link>
                ) : (
                  <div key={action.label}>{inner}</div>
                )
              })}
            </div>
          </div>

          <NextEventCard />
        </div>
      </div>
    </div>
  )
}
