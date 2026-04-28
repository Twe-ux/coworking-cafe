"use client"
import { signOut } from "next-auth/react"
import { Icon } from "@/components/ui/Icon"
import { MOCK_USER, MOCK_STATS } from "@/types/dashboard"
import { InfoCard, SettingsCard, StatCard } from "./ProfileRows"

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

const INFO_FIELDS = (email: string, phone: string, company: string) => [
  { icon: 'mail' as const,     label: 'Email',      value: email   },
  { icon: 'phone' as const,    label: 'Téléphone',  value: phone   },
  { icon: 'building' as const, label: 'Entreprise', value: company },
]

const SETTINGS_ITEMS = [
  { icon: 'bell' as const,   label: 'Notifications'         },
  { icon: 'shield' as const, label: 'Sécurité & mot de passe' },
  { icon: 'gear' as const,   label: 'Préférences'            },
  { icon: 'cookie' as const, label: 'Aide & support'         },
]

export function ProfileScreen() {
  const user = MOCK_USER
  const stats = MOCK_STATS

  const infoFields = INFO_FIELDS(
    user.email,
    user.phone ?? '',
    user.company ?? '',
  ).filter(f => f.value !== '')

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100dvh', paddingBottom: 24 }}>

      {/* Avatar + identity — centered */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 20px 24px', textAlign: 'center' }}>
        <div
          className="font-serif"
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--main), #2e5e58)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 14px',
          }}
        >
          {initials(user.name)}
        </div>

        {/* Name */}
        <div className="font-serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1.1 }}>
          {user.name}
        </div>

        {/* Member since */}
        <div className="font-mono" style={{ fontSize: 13, color: 'var(--gry)', marginTop: 4 }}>
          Membre depuis {user.memberSince}
        </div>

        {/* Plan chip — honey/miel style with star icon */}
        <span
          className="font-mono"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(242,211,129,0.22)', color: '#8A6B1F',
            fontSize: 11, fontWeight: 500,
          }}
        >
          <Icon name="star" size={12} fill="var(--btn-dark)" stroke="var(--btn-dark)" />
          {user.plan}
        </span>
      </div>

      {/* Cards stack */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Info rows */}
        <InfoCard fields={infoFields} />

        {/* Stats 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatCard
            icon="clock"
            iconStroke="var(--main)"
            iconBg="rgba(65,121,114,0.08)"
            value={stats.hoursBooked}
            unit="h"
            label="Heures réservées"
          />
          <StatCard
            icon="tag"
            iconStroke="var(--main)"
            iconBg="rgba(65,121,114,0.08)"
            value={stats.savings}
            unit="€"
            label="Économisés (fidélité)"
          />
        </div>

        {/* Settings rows */}
        <SettingsCard items={SETTINGS_ITEMS} />

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="font-sans"
          style={{
            marginTop: 6, padding: 16, borderRadius: 14,
            background: 'rgba(192,83,76,0.08)', color: 'var(--danger)',
            border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%',
          }}
        >
          <Icon name="logout" size={16} stroke="var(--danger)" />
          Se déconnecter
        </button>

      </div>
    </div>
  )
}
