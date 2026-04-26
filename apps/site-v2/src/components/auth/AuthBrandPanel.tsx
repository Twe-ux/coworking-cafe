import { AuthLogo } from "./AuthLogo"

interface AuthBrandPanelProps {
  mode: "login" | "register"
}

const STATS = [
  { value: "420+", label: "Membres actifs" },
  { value: "4", label: "Espaces" },
  { value: "7j/7", label: "Ouvert" },
] as const

const TEXTS = {
  login:
    "Retrouvez vos réservations, vos crédits horaires et votre programme fidélité dans votre espace membre.",
  register:
    "Rejoignez 420+ membres : un café, un coin lecture, et quatre espaces de travail au cœur de la ville.",
} as const

export function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  return (
    <div
      className="relative overflow-hidden flex flex-col"
      style={{
        background: "var(--body)",
        color: "#fff",
        padding: "44px 48px",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "rgba(65,121,114,0.3)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(242,211,129,0.12)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col h-full" style={{ zIndex: 1 }}>
        <AuthLogo onDark size={40} />

        <div className="mt-auto" style={{ maxWidth: 420 }}>
          {/* Eyebrow */}
          <div
            className="font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--btn)",
              marginBottom: 14,
            }}
          >
            — UN LIEU, MILLE POSSIBLES
          </div>

          {/* Headline */}
          <h2
            className="font-serif"
            style={{
              fontSize: 52,
              lineHeight: 1,
              margin: 0,
              letterSpacing: "-0.03em",
              fontWeight: 400,
              color: "#fff",
            }}
          >
            Travailler autrement,
            <br />
            <em style={{ color: "var(--btn)", fontStyle: "italic" }}>ensemble</em>.
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              marginTop: 22,
              marginBottom: 0,
            }}
          >
            {TEXTS[mode]}
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 36,
              marginTop: 36,
              paddingTop: 28,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <div
                  className="font-serif"
                  style={{ fontSize: 26, color: "var(--btn)", lineHeight: 1 }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
