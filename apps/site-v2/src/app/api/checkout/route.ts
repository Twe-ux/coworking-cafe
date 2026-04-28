export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getStripe } from "@/lib/stripe"

const CheckoutBodySchema = z.object({
  amount: z.number(),
  spaceId: z.string(),
  spaceLabel: z.string(),
  bookingType: z.string(),
  date: z.string(),
  startTime: z.string(),
  hours: z.number(),
  services: z.array(z.string()),
  venueId: z.string().nullable(),
  specialRequest: z.string(),
})

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = CheckoutBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    )
  }

  const data = parsed.data

  if (data.amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be greater than 0" },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: "eur",
      capture_method: "automatic",
      metadata: {
        spaceId: data.spaceId,
        spaceLabel: data.spaceLabel,
        bookingType: data.bookingType,
        date: data.date,
        startTime: data.startTime,
        hours: String(data.hours),
        services: JSON.stringify(data.services),
        venueId: data.venueId ?? "",
        specialRequest: data.specialRequest,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    )
  }
}
