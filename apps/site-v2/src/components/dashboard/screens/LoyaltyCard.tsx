import { Icon } from "@/components/ui/Icon";

interface LoyaltyCardProps {
  memberPoints: number;
  nextReward: number;
}

export function LoyaltyCard({ memberPoints, nextReward }: LoyaltyCardProps) {
  const progressPct = Math.min((memberPoints / nextReward) * 100, 100);
  const ptsRemaining = nextReward - memberPoints;

  return (
    <div
      style={{
        margin: "12px 16px 0",
        background: "#0e1110", // dark profond pour contraste — intentionnel, pas un token
        borderRadius: 22,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Overlay décoratif */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(65,121,114,0.25), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="sparkle" size={14} stroke="var(--btn)" />
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Programme fidélité
          </span>
        </div>

        <div
          className="font-serif"
          style={{
            fontSize: 38,
            color: "var(--btn)",
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          {memberPoints}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}
        >
          points de fidélité
        </div>

        <div
          style={{
            marginTop: 16,
            background: "rgba(255,255,255,0.1)",
            height: 6,
            borderRadius: 3,
          }}
        >
          <div
            style={{
              background: "var(--btn)",
              height: 6,
              borderRadius: 3,
              width: `${progressPct}%`,
            }}
          />
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            marginTop: 8,
          }}
        >
          Prochaine récompense: boisson offerte · {ptsRemaining} pts
        </div>
      </div>
    </div>
  );
}
