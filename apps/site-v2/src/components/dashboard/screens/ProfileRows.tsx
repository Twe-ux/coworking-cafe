"use client"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/Icon"

// ─── InfoRow ────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: IconName
  label: string
  value: string
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
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

// ─── SettingsRow ─────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: IconName
  label: string
}

export function SettingsRow({ icon, label }: SettingsRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', background: '#fff', cursor: 'pointer',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'rgba(65,121,114,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={17} stroke="var(--main)" />
      </div>
      <span className="font-sans" style={{ flex: 1, fontSize: 14.5, color: 'var(--body)' }}>
        {label}
      </span>
      <Icon name="chevRight" size={16} stroke="var(--gry)" />
    </div>
  )
}

// ─── SettingsDivider ──────────────────────────────────────────────────────────

export function SettingsDivider() {
  return (
    <div style={{ height: 1, background: 'var(--line)', marginLeft: 62 }} />
  )
}
