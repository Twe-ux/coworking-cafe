import Image from "next/image"

interface AuthLogoProps {
  onDark?: boolean
  size?: number
}

export function AuthLogo({ onDark = false, size = 36 }: AuthLogoProps) {
  const titleSize = Math.round(size * 0.55)
  const src = onDark ? "/logo-circle-white.webp" : "/logo-circle.webp"

  return (
    <div className="flex items-center gap-[10px]">
      <Image
        src={src}
        alt="CoworKing Café"
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
      />
      <div>
        <div
          className="font-serif leading-tight"
          style={{
            fontSize: titleSize,
            color: onDark ? "#fff" : "var(--body)",
            letterSpacing: "-0.01em",
          }}
        >
          CoworKing Café
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: onDark ? "rgba(255,255,255,0.5)" : "var(--gry)",
            marginTop: 2,
          }}
        >
          ESPACE MEMBRE
        </div>
      </div>
    </div>
  )
}
