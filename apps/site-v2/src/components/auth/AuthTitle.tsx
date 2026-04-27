"use client"

interface AuthTitleProps {
  eyebrow: string
  h1Mobile: string
  h1Desktop?: string
  lead?: string
  accentWord?: string
}

function renderTitle(text: string, accentWord: string | undefined, fontSize: number) {
  if (!accentWord || !text.includes(accentWord)) {
    return (
      <h1
        className="font-serif"
        style={{
          fontSize,
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "var(--body)",
          margin: 0,
        }}
      >
        {text}
      </h1>
    )
  }

  const parts = text.split(accentWord)
  return (
    <h1
      className="font-serif"
      style={{
        fontSize,
        fontWeight: 400,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: "var(--body)",
        margin: 0,
      }}
    >
      {parts[0]}
      <em style={{ color: "var(--main)", fontStyle: "italic" }}>{accentWord}</em>
      {parts[1]}
    </h1>
  )
}

export function AuthTitle({ eyebrow, h1Mobile, h1Desktop, lead, accentWord }: AuthTitleProps) {
  const desktopText = h1Desktop ?? h1Mobile

  return (
    <div className="mb-6">
      <div
        className="eyebrow"
        style={{ color: "var(--main)", marginBottom: 8 }}
      >
        {eyebrow}
      </div>

      {/* Mobile title */}
      <div className="md:hidden">
        {renderTitle(h1Mobile, accentWord, 34)}
      </div>

      {/* Desktop title */}
      <div className="hidden md:block">
        {renderTitle(desktopText, accentWord, 44)}
        {lead && (
          <p
            className="lead hidden md:block font-sans"
            style={{ color: "var(--gry)", marginTop: 14 }}
          >
            {lead}
          </p>
        )}
      </div>
    </div>
  )
}
