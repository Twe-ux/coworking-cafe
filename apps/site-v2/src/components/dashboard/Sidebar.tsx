"use client"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import type { DashboardSection } from "@/types/dashboard"
import type { IconName } from "@/components/ui/Icon"

interface SidebarProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
}

interface NavItem {
  key: DashboardSection | 'new'
  label: string
  icon: IconName
  badge?: string
  href?: string
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home',         label: 'Tableau de bord',      icon: 'home' },
  { key: 'reservations', label: 'Mes réservations',      icon: 'calendar', badge: '2' },
  { key: 'new',          label: 'Nouvelle réservation',  icon: 'plus', href: '/booking' },
]

const FOOTER_ITEMS: NavItem[] = [
  { key: 'profile', label: 'Profil', icon: 'user' },
]

export function Sidebar({ section, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 260,
        height: '100%',
        background: 'var(--body)',
        padding: '28px 18px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 28px' }}>
        <div
          style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--btn)', color: 'var(--body)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="building" size={20} stroke="var(--body)" />
        </div>
        <div>
          <div className="font-serif" style={{ fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>
            CoworKing
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
            CAFÉ · MEMBRE
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = section === item.key
          const content = (
            <>
              <Icon
                name={item.icon}
                size={17}
                stroke={isActive ? 'var(--btn)' : 'rgba(255,255,255,0.7)'}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="font-mono" style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 8,
                  background: isActive ? 'var(--btn)' : 'rgba(255,255,255,0.08)',
                  color: isActive ? 'var(--body)' : 'rgba(255,255,255,0.6)',
                }}>
                  {item.badge}
                </span>
              )}
            </>
          )
          const sharedStyle: React.CSSProperties = {
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
            background: isActive ? 'rgba(242,211,129,0.12)' : 'transparent',
            color: isActive ? 'var(--btn)' : 'rgba(255,255,255,0.7)',
            fontSize: 13.5, fontWeight: isActive ? 500 : 400,
            textDecoration: 'none', border: 'none', width: '100%', fontFamily: 'Inter, sans-serif',
          }
          if (item.href) {
            return <Link key={item.key} href={item.href} style={sharedStyle}>{content}</Link>
          }
          return (
            <button
              key={item.key}
              onClick={() => item.key !== 'new' && onNavigate(item.key as DashboardSection)}
              style={sharedStyle}
            >
              {content}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {FOOTER_ITEMS.map((item) => {
          const isActive = section === item.key
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key as DashboardSection)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                background: isActive ? 'rgba(242,211,129,0.12)' : 'transparent',
                color: isActive ? 'var(--btn)' : 'rgba(255,255,255,0.7)',
                fontSize: 13.5, border: 'none', width: '100%', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Icon name={item.icon} size={17} stroke={isActive ? 'var(--btn)' : 'rgba(255,255,255,0.7)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
