"use client"
import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/Icon"

// ─── InfoCard ────────────────────────────────────────────────────────────────

interface InfoField {
  icon: IconName
  label: string
  value: string
}

interface InfoCardProps {
  fields: InfoField[]
}

export function InfoCard({ fields }: InfoCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      {fields.map((field, i) => (
        <div key={field.icon}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', cursor: 'pointer',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'rgba(65,121,114,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={field.icon} size={17} stroke="var(--main)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--gry)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                {field.label}
              </div>
              <div className="font-sans" style={{ fontSize: 14, color: 'var(--body)' }}>
                {field.value}
              </div>
            </div>
            <Icon name="edit" size={15} stroke="var(--gry)" />
          </div>
          {i < fields.length - 1 && (
            <div style={{ height: 1, background: 'var(--line)', marginLeft: 68 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── SettingsCard ─────────────────────────────────────────────────────────────

interface SettingsItem {
  icon: IconName
  label: string
}

interface SettingsCardProps {
  items: SettingsItem[]
}

export function SettingsCard({ items }: SettingsCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--line)',
      overflow: 'hidden',
    }}>
      {items.map((item, i) => (
        <div key={item.icon}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', cursor: 'pointer',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(65,121,114,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name={item.icon} size={16} stroke="var(--main)" />
            </div>
            <span className="font-sans" style={{ flex: 1, fontSize: 14.5, color: 'var(--body)' }}>
              {item.label}
            </span>
            <Icon name="chevRight" size={16} stroke="var(--gry)" />
          </div>
          {i < items.length - 1 && (
            <div style={{ height: 1, background: 'var(--line)', marginLeft: 62 }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: IconName
  iconStroke: string
  iconBg: string
  value: number
  unit: string
  label: string
}

export function StatCard({ icon, iconStroke, iconBg, value, unit, label }: StatCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--line)',
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={17} stroke={iconStroke} />
      </div>
      <div>
        <div className="font-serif" style={{ fontSize: 26, color: 'var(--body)', lineHeight: 1 }}>
          {value}<span style={{ fontSize: 13, color: 'var(--gry)' }}>{unit}</span>
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--gry)', marginTop: 3 }}>
          {label}
        </div>
      </div>
    </div>
  )
}
