"use client"
import { signOut } from "next-auth/react"
import { Icon } from "@/components/ui/Icon"
import { MOCK_USER, MOCK_STATS } from "@/types/dashboard"
import type { IconName } from "@/components/ui/Icon"

interface InfoRowProps {
  icon: IconName
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', background: '#fff',
      borderRadius: 16, border: '1px solid var(--line)', cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'rgba(65,121,114,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={18} stroke="var(--main)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--gry)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
          {label}
        </div>
        <div className="font-sans" style={{ fontSize: 14, color: 'var(--body)' }}>
          {value}
        </div>
      </div>
      <Icon name="chevRight" size={16} stroke="var(--gry)" />
    </div>
  )
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

export function ProfileScreen() {
  const user = MOCK_USER
  const stats = MOCK_STATS

  return (
    <div style={{ padding: '24px 16px 40px', background: 'var(--cream)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 className="font-serif" style={{ fontSize: 26, color: 'var(--body)', margin: 0 }}>
          Mon profil
        </h1>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(65,121,114,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="gear" size={17} stroke="var(--body)" />
        </button>
      </div>

      {/* Avatar + identité */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div
          className="font-serif"
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'var(--main)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 14,
          }}
        >
          {initials(user.name)}
        </div>
        <div className="font-serif" style={{ fontSize: 24, color: 'var(--body)', marginBottom: 8 }}>
          {user.name}
        </div>
        <span
          className="font-mono"
          style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 99,
            background: 'rgba(65,121,114,0.1)', color: 'var(--main)',
            marginBottom: 6,
          }}
        >
          {user.plan}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--gry)' }}>
          Membre depuis {user.memberSince}
        </span>
      </div>

      {/* Infos */}
      <p className="eyebrow" style={{ color: 'var(--gry)', marginBottom: 10 }}>Mes informations</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        <InfoRow icon="mail" label="Email" value={user.email} />
      </div>

      {/* Abonnement */}
      <p className="eyebrow" style={{ color: 'var(--gry)', marginBottom: 10 }}>Mon abonnement</p>
      <div
        style={{
          background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16, marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 14,
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(65,121,114,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={18} stroke="var(--main)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--body)' }}>{user.plan}</div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--gry)', marginTop: 2 }}>
            {stats.memberPoints} pts · prochain palier à {stats.nextReward} pts
          </div>
        </div>
        <Icon name="chevRight" size={16} stroke="var(--gry)" />
      </div>

      {/* Déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="font-sans"
        style={{
          width: '100%', padding: '14px', borderRadius: 14,
          background: 'rgba(192,83,76,0.08)', border: '1px solid rgba(192,83,76,0.15)',
          color: 'var(--danger)', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Icon name="logout" size={16} stroke="var(--danger)" />
        Se déconnecter
      </button>
    </div>
  )
}
