interface PasswordStrengthProps {
  password: string
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4

const STRENGTH_LABELS: Record<StrengthLevel, string> = {
  0: "",
  1: "Trop court",
  2: "Moyen",
  3: "Sécurisé",
  4: "Solide",
}

const STRENGTH_COLORS: Record<StrengthLevel, string> = {
  0: "var(--line)",
  1: "var(--danger)",
  2: "var(--btn-dark)",
  3: "var(--main)",
  4: "var(--main)",
}

function computeStrength(password: string): StrengthLevel {
  if (!password) return 0
  if (password.length < 6) return 1

  const hasUppercase = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const isLong = password.length >= 10

  if (isLong && hasUppercase && hasDigit) return 4
  if (password.length >= 8) return 3
  return 2
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = computeStrength(password)
  const color = STRENGTH_COLORS[strength]
  const label = STRENGTH_LABELS[strength]

  return (
    <div
      className="flex flex-col gap-1.5 mt-2"
      style={{ minHeight: 32, visibility: password ? 'visible' : 'hidden' }}
    >
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map((level) => (
          <span
            key={level}
            className="flex-1 rounded-sm transition-colors"
            style={{
              height: 3,
              background: level <= strength ? color : "var(--line)",
            }}
          />
        ))}
      </div>
      {label && (
        <span className="text-[11px]" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}
