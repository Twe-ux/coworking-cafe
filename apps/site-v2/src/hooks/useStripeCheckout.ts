"use client"

import { useState, useEffect } from "react"
import type { BookingState, PriceBreakdown, Space, BookingService } from "@/types/booking"

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseStripeCheckoutProps {
  state: BookingState
  pricing: PriceBreakdown
  spaces: Space[]
  services: BookingService[]
  enabled: boolean // true when step === 4
}

export interface UseStripeCheckoutReturn {
  clientSecret: string | null
  isCreating: boolean
  error: string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStripeCheckout({
  state,
  pricing,
  spaces,
  enabled,
}: UseStripeCheckoutProps): UseStripeCheckoutReturn {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setClientSecret(null)
      return
    }

    if (!state.spaceId || !state.date || pricing.total <= 0) return

    const controller = new AbortController()

    async function createPaymentIntent() {
      setIsCreating(true)
      setError(null)

      try {
        const spaceLabel = spaces.find((s) => s.id === state.spaceId)?.name ?? state.spaceId ?? ""

        const body = {
          amount: pricing.total,
          spaceId: state.spaceId,
          spaceLabel,
          bookingType: state.bookingType,
          date: state.date,
          startTime: state.startTime ?? "",
          hours: pricing.hours,
          services: state.services,
          venueId: state.venueId,
          specialRequest: state.specialRequest,
        }

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Response not ok")

        const data = (await res.json()) as { clientSecret: string }
        setClientSecret(data.clientSecret)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setError("Impossible de préparer le paiement. Réessayez.")
      } finally {
        setIsCreating(false)
      }
    }

    void createPaymentIntent()

    return () => {
      controller.abort()
    }
  }, [enabled, state.spaceId, state.date, pricing.total]) // eslint-disable-line react-hooks/exhaustive-deps

  return { clientSecret, isCreating, error }
}
