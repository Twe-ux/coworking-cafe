import { Icon } from "@/components/ui/Icon"

export function NextEventCard() {
  return (
    <div style={{
      background: 'var(--cream)',
      border: '1px solid var(--line)',
      borderRadius: 22,
      padding: 'clamp(20px, 2.4vw, 30px)',
    }}>
      <div className="font-mono" style={{
        fontSize: 10.5,
        letterSpacing: '0.14em',
        color: 'var(--main)',
        textTransform: 'uppercase',
      }}>
        — À ne pas manquer
      </div>

      <div className="font-serif" style={{
        fontSize: 18,
        marginTop: 10,
        color: 'var(--body)',
        lineHeight: 1.3,
      }}>
        Atelier · Freelance &amp; impôts
      </div>

      <div style={{
        fontSize: 12.5,
        color: 'var(--gry)',
        marginTop: 6,
        display: 'flex',
        gap: 12,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="calendar" size={11} stroke="var(--gry)" />
          Lun 06/05
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="clock" size={11} stroke="var(--gry)" />
          19h–21h
        </span>
      </div>

      <div style={{
        marginTop: 14,
        padding: 10,
        background: '#fff',
        borderRadius: 10,
        fontSize: 11.5,
        color: 'var(--gry)',
        border: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <Icon name="check" size={11} stroke="var(--main)" sw={2.5} />
        Vous êtes inscrit · Confirmation envoyée par email
      </div>
    </div>
  )
}
