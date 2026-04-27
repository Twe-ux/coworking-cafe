import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  // Non-PWA browsers: tint the Safari toolbar with the auth bg color
  themeColor: "#DDE6DE",
}

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
    <div className="auth-layout">
      <div className="auth-scroll">
        {children}
      </div>
    </div>
  )
}
