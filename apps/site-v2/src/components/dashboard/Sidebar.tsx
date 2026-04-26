"use client"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import type { DashboardSection } from "@/types/dashboard"
import type { IconName } from "@/components/ui/Icon"

interface SidebarProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
  userName: string
  userEmail: string
  userPlan: string
}

interface NavItem {
  key: DashboardSection
  label: string
  icon: IconName
  badge?: string
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { key: 'home', label: 'Tableau de bord', icon: 'home' },
    ],
  },
  {
    label: 'MON COMPTE',
    items: [
      { key: 'reservations', label: 'Mes réservations', icon: 'calendar', badge: '2' },
      { key: 'history',      label: 'Historique',        icon: 'clock' },
      { key: 'wallet',       label: 'Portefeuille',       icon: 'wallet' },
      { key: 'loyalty',      label: 'Fidélité',           icon: 'star' },
    ],
  },
  {
    label: 'COMMUNAUTÉ',
    items: [
      { key: 'profile',   label: 'Profil',     icon: 'user' },
      { key: 'events',    label: 'Événements', icon: 'sparkle' },
      { key: 'directory', label: 'Annuaire',   icon: 'people' },
    ],
  },
]

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

function NavButton({ item, isActive, onNavigate }: { item: NavItem; isActive: boolean; onNavigate: () => void }) {
  return (
    <button
      onClick={onNavigate}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
        background: isActive ? 'rgba(242,211,129,0.1)' : 'transparent',
        color: isActive ? 'var(--btn)' : 'rgba(255,255,255,0.65)',
        fontSize: 14, fontWeight: 500,
        border: isActive ? '1px solid rgba(242,211,129,0.22)' : '1px solid transparent',
        width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif',
      }}
    >
      <Icon name={item.icon} size={17} stroke={isActive ? 'var(--btn)' : 'currentColor'} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span className="font-mono" style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: 'var(--main)', color: '#fff', fontWeight: 500 }}>
          {item.badge}
        </span>
      )}
    </button>
  )
}

function UserFooter({ name, email, plan }: { name: string; email: string; plan: string }) {
  return (
    <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '14px 12px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="font-mono" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--body)', flexShrink: 0 }}>
        {getInitials(name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#fff', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{name}</div>
        <div className="font-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
      </div>
      <span className="font-mono" style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'rgba(242,211,129,0.15)', color: 'var(--btn)', flexShrink: 0 }}>
        {plan}
      </span>
    </div>
  )
}

export function Sidebar({ section, onNavigate, userName, userEmail, userPlan }: SidebarProps) {
  return (
    <aside style={{ width: 260, height: '100%', background: 'var(--body)', padding: '24px 18px', display: 'flex', flexDirection: 'column', flexShrink: 0, gap: 6 }}>
      {/* Logo block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="building" size={18} stroke="var(--body)" />
        </div>
        <div>
          <div className="font-serif" style={{ fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>CoworKing</div>
          <div className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>CAFÉ · MEMBRE</div>
        </div>
      </div>

      {/* Nav groups */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginLeft: 12, marginBottom: 4, marginTop: gi === 0 ? 0 : 16 }}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavButton key={item.key} item={item} isActive={section === item.key} onNavigate={() => onNavigate(item.key)} />
            ))}
          </div>
        ))}

        {/* Nouvelle réservation */}
        <div style={{ marginTop: 8 }}>
          <Link href="/booking" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(242,211,129,0.25)', color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
            <Icon name="plus" size={17} stroke="currentColor" />
            <span>Nouvelle réservation</span>
          </Link>
        </div>
      </nav>

      <UserFooter name={userName} email={userEmail} plan={userPlan} />
    </aside>
  )
}
