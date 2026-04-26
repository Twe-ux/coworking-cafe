"use client"
import { Icon } from "@/components/ui/Icon"
import type { DashboardSection } from "@/types/dashboard"
import type { IconName } from "@/components/ui/Icon"

interface SidebarProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
  userName: string
  userMemberSince: string
  userPlan: string
}

interface NavItem {
  key: DashboardSection
  label: string
  icon: IconName
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Tableau de bord',
    items: [
      { key: 'home',         label: "Vue d'ensemble",     icon: 'home' },
      { key: 'reservations', label: 'Mes réservations',   icon: 'calendar', badge: '3' },
      { key: 'history',      label: 'Historique',          icon: 'clock' },
    ],
  },
  {
    label: 'Mon compte',
    items: [
      { key: 'wallet',  label: 'Crédits & facturation', icon: 'wallet' },
      { key: 'loyalty', label: 'Fidélité',               icon: 'sparkle' },
      { key: 'profile', label: 'Profil',                 icon: 'user' },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { key: 'events',    label: 'Événements',      icon: 'ticket' },
      { key: 'directory', label: 'Annuaire membres', icon: 'people' },
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

function UserFooter({ name, memberSince, plan }: { name: string; memberSince: string; plan: string }) {
  return (
    <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="font-serif" style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--main), #5A938B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', flexShrink: 0 }}>
        {getInitials(name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {plan} · {memberSince}
        </div>
      </div>
      <Icon name="chevRight" size={14} stroke="rgba(255,255,255,0.4)" />
    </div>
  )
}

export function Sidebar({ section, onNavigate, userName, userMemberSince, userPlan }: SidebarProps) {
  return (
    <aside style={{ width: 260, height: '100%', background: 'var(--body)', padding: '24px 18px', display: 'flex', flexDirection: 'column', flexShrink: 0, gap: 6 }}>
      {/* Logo block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--btn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="building" size={18} stroke="var(--body)" />
        </div>
        <div>
          <div className="font-serif" style={{ fontSize: 15, color: '#fff', letterSpacing: '-0.01em' }}>CoworKing Café</div>
          <div className="font-mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>ESPACE MEMBRE</div>
        </div>
      </div>

      {/* Nav groups */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="font-mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', padding: '18px 14px 8px' }}>
              — {group.label}
            </div>
            {group.items.map((item) => (
              <NavButton key={item.key} item={item} isActive={section === item.key} onNavigate={() => onNavigate(item.key)} />
            ))}
          </div>
        ))}
      </nav>

      <UserFooter name={userName} memberSince={userMemberSince} plan={userPlan} />
    </aside>
  )
}
