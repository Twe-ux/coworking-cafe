import Link from "next/link"
import { Icon } from "@/components/ui/Icon"

interface DesktopTopbarProps {
  userName: string
}

export function DesktopTopbar({ userName }: DesktopTopbarProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 34,
      gap: 20,
      flexWrap: 'wrap',
    }}>
      <div>
        <div className="font-mono" style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--gry)',
          marginBottom: 10,
          textTransform: 'uppercase',
        }}>
          — 01 · Tableau de bord
        </div>
        <h1 className="font-serif" style={{
          fontSize: 'clamp(30px, 3.5vw, 44px)',
          letterSpacing: '-0.02em',
          color: 'var(--body)',
          lineHeight: 1.1,
          margin: 0,
        }}>
          Bonjour {userName},{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--main)' }}>journée productive ?</em>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{
          width: 42,
          height: 42,
          border: '1px solid var(--line)',
          background: '#fff',
          borderRadius: 12,
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: 'var(--danger)',
          }} />
          <Icon name="bell" size={17} stroke="var(--body)" />
        </button>

        <Link href="/booking" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'var(--btn)',
            color: 'var(--body)',
            padding: '12px 20px',
            border: 'none',
            borderRadius: 100,
            fontSize: 13.5,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'inherit',
          }}>
            <Icon name="plus" size={14} stroke="#1A1A1A" sw={2.5} />
            Nouvelle réservation
          </button>
        </Link>
      </div>
    </div>
  )
}
