interface DesktopLoyaltyCardProps {
  points: number
  progressPct: number
}

export function DesktopLoyaltyCard({ points, progressPct }: DesktopLoyaltyCardProps) {
  return (
    <div style={{
      background: 'var(--body)',
      color: '#fff',
      borderRadius: 22,
      padding: 'clamp(20px, 2.4vw, 30px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: -40,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(242,211,129,0.08)',
        pointerEvents: 'none',
      }} />

      <div className="font-mono" style={{
        fontSize: 10.5,
        letterSpacing: '0.14em',
        color: 'var(--btn)',
        textTransform: 'uppercase',
      }}>
        — Fidélité
      </div>

      <div className="font-serif" style={{
        fontSize: 54,
        color: 'var(--btn)',
        lineHeight: 1,
        marginTop: 10,
      }}>
        {points.toLocaleString('fr-FR')}<span style={{ fontSize: 18, opacity: 0.6 }}>pts</span>
      </div>

      <div style={{ fontSize: 13, opacity: 0.75, marginTop: 10 }}>
        Plus que{' '}
        <strong style={{ color: 'var(--btn)' }}>260 points</strong>
        {' '}avant le palier{' '}
        <strong>Ambassadeur</strong>.
      </div>

      <div style={{
        marginTop: 20,
        background: 'rgba(255,255,255,0.08)',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--btn)', borderRadius: 3 }} />
      </div>

      <div className="font-mono" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 8,
        fontSize: 11,
        opacity: 0.6,
      }}>
        <span>Régulier</span>
        <span>{progressPct}%</span>
        <span>Ambassadeur</span>
      </div>

      <button style={{
        marginTop: 20,
        width: '100%',
        background: 'var(--btn)',
        color: 'var(--body)',
        border: 'none',
        borderRadius: 100,
        padding: '12px 18px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Voir les récompenses →
      </button>
    </div>
  )
}
