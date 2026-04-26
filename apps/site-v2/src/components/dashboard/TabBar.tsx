"use client"
import { Icon } from "@/components/ui/Icon"
import type { DashboardSection } from "@/types/dashboard"

interface TabBarProps {
  section: DashboardSection
  onNavigate: (section: DashboardSection) => void
}

const TABS = [
  { key: 'home' as DashboardSection, label: 'Accueil', icon: 'home' },
  { key: 'reservations' as DashboardSection, label: 'Résas', icon: 'calendar' },
  { key: 'profile' as DashboardSection, label: 'Profil', icon: 'user' },
] as const

export function TabBar({ section, onNavigate }: TabBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--body)',
        borderRadius: '22px 22px 0 0',
        padding: `8px 16px env(safe-area-inset-bottom, 20px)`,
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const isActive = section === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              padding: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
                background: isActive ? 'var(--btn)' : 'transparent',
              }}
            >
              <Icon
                name={tab.icon}
                size={18}
                stroke={isActive ? 'var(--body)' : 'rgba(255,255,255,0.55)'}
                sw={isActive ? 2 : 1.6}
              />
            </div>
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.04em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
