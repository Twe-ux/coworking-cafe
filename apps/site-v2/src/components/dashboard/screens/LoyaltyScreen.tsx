import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { MOCK_STATS } from "@/types/dashboard";

interface Tier {
  points: number;
  reward: string;
  status: "done" | "active" | "locked";
  icon: IconName;
}

interface Badge {
  label: string;
  icon: IconName;
  earned: boolean;
}

const TIERS: Tier[] = [
  { points: 100,  reward: "10% de réduction", status: "done",   icon: "checkCircle" },
  { points: 250,  reward: "Café gratuit",      status: "done",   icon: "checkCircle" },
  { points: 500,  reward: "Boisson offerte",   status: "active", icon: "sparkle"     },
  { points: 1000, reward: "Weekend gratuit",   status: "locked", icon: "lock"        },
];

const BADGES: Badge[] = [
  { label: "5 sessions", icon: "calendar", earned: true  },
  { label: "Ami",        icon: "people",   earned: true  },
  { label: "Partenaire", icon: "building", earned: false },
  { label: "VIP",        icon: "star",     earned: false },
];

const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-mono, monospace)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--gry)",
  margin: 0,
};

const TIER_STYLE: Record<Tier["status"], { bg: string; iconColor: string }> = {
  done:   { bg: "rgba(76,160,110,0.12)",  iconColor: "var(--success)"  },
  active: { bg: "rgba(242,211,129,0.20)", iconColor: "var(--btn-dark)" },
  locked: { bg: "rgba(0,0,0,0.04)",       iconColor: "var(--gry)"      },
};

const TIER_BADGE: Record<Tier["status"], { label: string; bg: string; color: string }> = {
  done:   { label: "Obtenu",     bg: "rgba(76,160,110,0.12)",  color: "var(--success)" },
  active: { label: "En cours",   bg: "rgba(214,138,60,0.12)",  color: "var(--warning)" },
  locked: { label: "Verrouillé", bg: "rgba(0,0,0,0.06)",       color: "var(--gry)"     },
};

export function LoyaltyScreen() {
  const progressPct = Math.min((MOCK_STATS.memberPoints / MOCK_STATS.nextReward) * 100, 100);
  const ptsRemaining = MOCK_STATS.nextReward - MOCK_STATS.memberPoints;

  return (
    <div style={{ background: "var(--cream)", minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 600, margin: "0 auto", width: "100%" }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, paddingTop: "env(safe-area-inset-top)", paddingLeft: 16, paddingRight: 16, paddingBottom: 14, background: "var(--cream)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <h1 className="font-serif" style={{ fontSize: 26, color: "var(--body)", margin: 0 }}>
            Fidélité
          </h1>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(65,121,114,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="sparkle" size={17} stroke="var(--main)" />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Hero card dark */}
        <div style={{ background: "var(--body)", borderRadius: 22, padding: 22, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle at center, rgba(65,121,114,0.25), transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="sparkle" size={14} stroke="var(--btn)" />
              <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Programme fidélité
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: 42, color: "var(--btn)", lineHeight: 1, marginTop: 8 }}>
              {MOCK_STATS.memberPoints}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              points de fidélité
            </div>
            <div style={{ marginTop: 16, background: "rgba(255,255,255,0.1)", height: 6, borderRadius: 3 }}>
              <div style={{ background: "var(--btn)", height: 6, borderRadius: 3, width: `${progressPct}%` }} />
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8 }}>
              Prochaine récompense : boisson offerte · {ptsRemaining} pts
            </div>
          </div>
        </div>

        {/* Paliers */}
        <div>
          <p className="font-mono" style={{ ...EYEBROW, marginBottom: 12 }}>Vos paliers</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIERS.map((tier) => {
              const ts = TIER_STYLE[tier.status];
              const tb = TIER_BADGE[tier.status];
              return (
                <div key={tier.points} style={{ background: "var(--white)", borderRadius: 14, border: "1px solid var(--line)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: ts.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={tier.icon} size={18} stroke={ts.iconColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-sans" style={{ fontSize: 14, color: "var(--body)", fontWeight: 500 }}>{tier.reward}</div>
                    <div className="font-mono" style={{ fontSize: 11, color: "var(--gry)", marginTop: 2 }}>{tier.points} pts</div>
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: tb.color, background: tb.bg, borderRadius: 20, padding: "4px 10px", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
                    {tb.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="font-mono" style={{ ...EYEBROW, marginBottom: 12 }}>Vos badges</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {BADGES.map((badge) => (
              <div key={badge.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: badge.earned ? 1 : 0.4 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: badge.earned ? "rgba(65,121,114,0.1)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={badge.icon} size={22} stroke={badge.earned ? "var(--main)" : "rgba(0,0,0,0.2)"} />
                </div>
                <span className="font-mono" style={{ fontSize: 9, color: "var(--body)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
