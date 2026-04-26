interface DesktopStatCardProps {
  value: number | string
  label: string
}

export function DesktopStatCard({ value, label }: DesktopStatCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      <div className="font-serif" style={{ fontSize: 32, color: 'var(--body)', lineHeight: 1 }}>
        {value}
      </div>
      <div className="font-mono" style={{
        fontSize: 11, color: 'var(--gry)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginTop: 8,
      }}>
        {label}
      </div>
    </div>
  )
}
