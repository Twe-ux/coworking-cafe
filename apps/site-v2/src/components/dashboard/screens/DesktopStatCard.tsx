import { Icon } from "@/components/ui/Icon"

interface DesktopStatCardProps {
  tag: string
  val: string | number
  unit?: string
  delta: string
  deltaPos: boolean
}

export function DesktopStatCard({ tag, val, unit, delta, deltaPos }: DesktopStatCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 18,
      padding: 20,
    }}>
      <div className="font-mono" style={{
        fontSize: 10.5,
        letterSpacing: '0.14em',
        color: 'var(--gry)',
        textTransform: 'uppercase',
      }}>
        — {tag}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 0 6px' }}>
        <span className="font-serif" style={{
          fontSize: 'clamp(28px, 3vw, 38px)',
          color: 'var(--body)',
          lineHeight: 1,
        }}>
          {val}
        </span>
        {unit && (
          <span className="font-sans" style={{ fontSize: 14, color: 'var(--gry)', fontWeight: 400 }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
        <Icon
          name={deltaPos ? 'arrowUp' : 'arrowDown'}
          size={12}
          stroke={deltaPos ? 'var(--main)' : 'var(--danger)'}
          sw={2.2}
        />
        <span style={{ color: deltaPos ? 'var(--main)' : 'var(--danger)' }}>
          {delta}
        </span>
      </div>
    </div>
  )
}
