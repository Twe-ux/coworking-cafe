import { Icon } from "@/components/ui/Icon"
import type { IconName } from "@/components/ui/Icon"

interface ActivityItem {
  date: string
  title: string
  sub: string
  icon: IconName
  color: string
}

const ACTIVITY: ActivityItem[] = [
  { date: 'Hier · 18h32', title: 'Réservation confirmée',          sub: 'Salle Verrière · 30 avril 14h–16h',   icon: 'check',   color: 'var(--main)'    },
  { date: 'Hier · 12h10', title: '+50 points fidélité',            sub: 'Journée complète en open-space',       icon: 'sparkle', color: 'var(--btn-dark)' },
  { date: 'Il y a 3j',    title: 'Facture #2026-0412',             sub: '179€ · Abonnement Mensuel · Réglée',   icon: 'receipt', color: 'var(--main)'    },
  { date: 'Il y a 5j',    title: 'Nouveau membre dans la communauté', sub: 'Camille R. · Designer UX',          icon: 'user',    color: '#5A938B'         },
]

function iconBg(color: string): string {
  if (color === 'var(--main)')     return 'rgba(65,121,114,0.15)'
  if (color === 'var(--btn-dark)') return 'rgba(138,107,31,0.15)'
  if (color === '#5A938B')         return 'rgba(90,147,139,0.15)'
  return 'rgba(65,121,114,0.15)'
}

export function ActivityFeed() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--line)',
      borderRadius: 22,
      padding: 'clamp(20px, 2.4vw, 30px)',
    }}>
      <div className="font-mono" style={{
        fontSize: 10.5,
        letterSpacing: '0.14em',
        color: 'var(--gry)',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        — Activité récente
      </div>
      <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 18, color: 'var(--body)', margin: '0 0 18px' }}>
        Ce qui s&apos;est passé
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ACTIVITY.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 14,
            padding: '14px 0',
            borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: iconBg(item.color),
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name={item.icon} size={15} stroke={item.color} sw={2.2} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: 'var(--body)', fontWeight: 500 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gry)', marginTop: 2 }}>
                {item.sub}
              </div>
            </div>

            <div className="font-mono" style={{ fontSize: 10.5, color: 'var(--gry)', letterSpacing: '0.1em' }}>
              {item.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
