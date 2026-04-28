import type { Metadata } from "next"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"

export const metadata: Metadata = {
  title: "Confirmation — CoworKing Café",
  robots: { index: false },
}

type Status = "succeeded" | "processing" | "error"

function resolveStatus(raw: string | undefined): Status {
  if (raw === "succeeded") return "succeeded"
  if (raw === "processing") return "processing"
  return "error"
}

const STATUS_CONFIG = {
  succeeded: {
    iconBg: "rgba(76,160,110,0.12)",
    iconName: "check" as const,
    iconStroke: "var(--main)",
    title: "Réservation confirmée",
    lead: "Un email de confirmation vous a été envoyé. Vous pouvez suivre votre réservation depuis votre espace membre.",
    cta: { href: "/dashboard", label: "Voir mes réservations" },
  },
  processing: {
    iconBg: "rgba(242,211,129,0.2)",
    iconName: "sparkle" as const,
    iconStroke: "var(--btn-dark)",
    title: "Paiement en cours...",
    lead: "Votre paiement est en cours de traitement. Vous recevrez un email dès que le paiement sera validé.",
    cta: { href: "/dashboard", label: "Voir mes réservations" },
  },
  error: {
    iconBg: "rgba(192,83,76,0.08)",
    iconName: "x" as const,
    iconStroke: "var(--danger)",
    title: "Paiement non abouti",
    lead: "Votre paiement n'a pas pu être traité. Aucun montant n'a été débité.",
    cta: { href: "/booking", label: "Réessayer" },
  },
} satisfies Record<Status, { iconBg: string; iconName: string; iconStroke: string; title: string; lead: string; cta: { href: string; label: string } }>

const pillBase: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  height: 52, borderRadius: 999, fontSize: 15, fontWeight: 500, textDecoration: "none",
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_status?: string; payment_intent?: string }>
}) {
  const params = await searchParams
  const status = resolveStatus(params.redirect_status)
  const intentId = params.payment_intent
  const cfg = STATUS_CONFIG[status]

  return (
    <main style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={cfg.iconName} size={32} stroke={cfg.iconStroke} sw={2} />
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: "var(--body)", margin: 0 }}>
            {cfg.title}
          </h1>
          <p className="font-sans" style={{ fontSize: 15, color: "var(--gry)", lineHeight: 1.55, margin: 0 }}>
            {cfg.lead}
          </p>
          {intentId && (
            <p className="font-mono" style={{ fontSize: 11, color: "var(--gry)", margin: 0 }}>
              Réf. {intentId.slice(0, 16)}...
            </p>
          )}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href={cfg.cta.href} className="font-sans w-full" style={{ ...pillBase, background: "var(--body)", color: "white" }}>
            {cfg.cta.label}
          </Link>
          <Link href="/" className="font-sans w-full" style={{ ...pillBase, border: "1px solid var(--line)", color: "var(--body)" }}>
            Retour à l&apos;accueil
          </Link>
        </div>

      </div>
    </main>
  )
}
