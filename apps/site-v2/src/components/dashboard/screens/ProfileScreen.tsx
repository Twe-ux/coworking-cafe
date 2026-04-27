"use client"
import { signOut } from "next-auth/react"
import { Icon } from "@/components/ui/Icon"
import { MOCK_USER, MOCK_STATS } from "@/types/dashboard"
import { InfoRow, SettingsRow, SettingsDivider } from "./ProfileRows"

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

export function ProfileScreen() {
  const user = MOCK_USER
  const stats = MOCK_STATS

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 16, paddingRight: 16, paddingBottom: 40, background: 'var(--cream)', minHeight: '100%' }}>

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
          style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--main)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 14 }}
        >
          {initials(user.name)}
        </div>
        <div className="font-serif" style={{ fontSize: 24, color: 'var(--body)', marginBottom: 8 }}>
          {user.name}
        </div>
        <span className="font-mono" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(65,121,114,0.1)', color: 'var(--main)', marginBottom: 6 }}>
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
        {user.phone && <InfoRow icon="phone" label="Téléphone" value={user.phone} />}
        {user.company && <InfoRow icon="sparkle" label="Entreprise" value={user.company} />}
      </div>

      {/* Abonnement */}
      <p className="eyebrow" style={{ color: 'var(--gry)', marginBottom: 10 }}>Mon abonnement</p>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', padding: 16, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
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

      {/* Stats */}
      <p className="eyebrow" style={{ color: 'var(--gry)', marginBottom: 10, marginTop: 28 }}>Mes stats</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid var(--line)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(65,121,114,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="clock" size={18} stroke="var(--main)" />
          </div>
          <div style={{ marginTop: 8, lineHeight: 1 }}>
            <span className="font-serif" style={{ fontSize: 28, color: 'var(--body)' }}>{stats.hoursBooked}</span>
            <span className="font-serif" style={{ fontSize: 28, color: 'var(--body)' }}>h</span>
          </div>
          <div className="font-sans" style={{ fontSize: 11, color: 'var(--gry)', marginTop: 4 }}>heures réservées</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, padding: 14, border: '1px solid var(--line)' }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(76,160,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="tag" size={18} stroke="#4CA06E" />
          </div>
          <div style={{ marginTop: 8, lineHeight: 1 }}>
            <span className="font-serif" style={{ fontSize: 28, color: 'var(--body)' }}>{stats.savings}€</span>
          </div>
          <div className="font-sans" style={{ fontSize: 11, color: 'var(--gry)', marginTop: 4 }}>économisés</div>
        </div>
      </div>

      {/* Paramètres */}
      <p className="eyebrow" style={{ color: 'var(--gry)', marginBottom: 10 }}>Paramètres</p>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 28 }}>
        <SettingsRow icon="bell" label="Notifications" />
        <SettingsDivider />
        <SettingsRow icon="lock" label="Sécurité & mot de passe" />
        <SettingsDivider />
        <SettingsRow icon="gear" label="Préférences" />
        <SettingsDivider />
        <SettingsRow icon="help" label="Aide & support" />
      </div>

      {/* Déconnexion */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="font-sans"
        style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(192,83,76,0.08)', border: '1px solid rgba(192,83,76,0.15)', color: 'var(--danger)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Icon name="logout" size={16} stroke="var(--danger)" />
        Se déconnecter
      </button>
    </div>
  )
}
