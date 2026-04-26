"use client"

interface SocialButtonProps {
  brand: "google" | "apple"
  onClick?: () => void
  disabled?: boolean
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.5-2.1 3.3v2.7h3.4c2-1.8 3.3-4.5 3.3-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.8 0 5.2-.9 7-2.6l-3.4-2.6c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-5.9-4.4H2.5v2.8C4.3 20.7 7.9 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M6.1 14.4c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.6H2.5C1.8 9 1.4 10.4 1.4 12s.4 3 1.1 4.4l3.6-2z"
      />
      <path
        fill="#EA4335"
        d="M12 5.5c1.6 0 3 .5 4.1 1.6l3-3C17.2 2.3 14.8 1.4 12 1.4 7.9 1.4 4.3 3.7 2.5 7.6l3.6 2.8c.8-2.5 3.1-4.4 5.9-4.9z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
      <path
        fill="#fff"
        d="M11.5 8.4c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-3-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.1 2.7 2.1s1.5-.7 2.8-.7c1.3 0 1.7.7 2.8.7s1.9-1 2.6-2c.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.4-.9-2.4-3.7zM9.4 2.3c.6-.7 1-1.7.9-2.7-.8 0-1.9.5-2.5 1.3-.5.6-1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2z"
      />
    </svg>
  )
}

export function SocialButton({
  brand,
  onClick,
  disabled = true,
}: SocialButtonProps) {
  const isApple = brand === "apple"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Disponible prochainement"
      className="flex items-center justify-center gap-2.5 w-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isApple ? "#000" : "#fff",
        color: isApple ? "#fff" : "var(--body)",
        border: isApple ? "none" : "1px solid var(--line)",
        borderRadius: 12,
        padding: "12px 18px",
        fontSize: 13.5,
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {isApple ? <AppleIcon /> : <GoogleIcon />}
      {isApple ? "Continuer avec Apple" : "Continuer avec Google"}
    </button>
  )
}
