import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { default: "Espace membre", template: "%s | CoworKing Café" },
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--auth-bg)",
        backgroundImage:
          "radial-gradient(circle at 15% 10%, #E9F0E7 0%, transparent 50%), radial-gradient(circle at 85% 90%, #D6E1D5 0%, transparent 50%)",
      }}
    >
      {children}
    </div>
  )
}
