"use client"

import { useState } from "react"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import type { StripeElementsOptions } from "@stripe/stripe-js"
import { stripePromise } from "@/lib/stripe-client"
import { Icon } from "@/components/ui/Icon"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentFormInnerProps {
  total: number
}

interface StripePaymentFormProps {
  clientSecret: string
  total: number
}

// ─── Inner form (uses useStripe / useElements — must live inside <Elements>) ──

function PaymentFormInner({ total }: PaymentFormInnerProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setStripeError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation`,
      },
    })

    if (error) {
      setStripeError(error.message ?? "Erreur de paiement.")
      setIsSubmitting(false)
    }
    // No error → Stripe redirects automatically
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PaymentElement />

      {stripeError && (
        <p className="font-sans" style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>
          {stripeError}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="font-sans font-medium w-full"
        style={{
          height: 52,
          borderRadius: 999,
          background: "var(--btn)",
          color: "var(--body)",
          border: "none",
          fontSize: 15,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          opacity: !stripe || isSubmitting ? 0.6 : 1,
        }}
      >
        {isSubmitting ? "Traitement..." : `Confirmer et payer — ${total.toFixed(2)} €`}
      </button>

      <div className="flex items-center justify-center gap-1.5">
        <Icon name="shield" size={12} stroke="var(--gry)" />
        <span className="font-mono" style={{ fontSize: 10, color: "var(--gry)" }}>
          Paiement sécurisé SSL · Stripe
        </span>
      </div>
    </form>
  )
}

// ─── Public component — wraps with <Elements> ─────────────────────────────────

export function StripePaymentForm({ clientSecret, total }: StripePaymentFormProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#417972",
        colorBackground: "#ffffff",
        colorText: "#1A1A1A",
        borderRadius: "8px",
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner total={total} />
    </Elements>
  )
}
