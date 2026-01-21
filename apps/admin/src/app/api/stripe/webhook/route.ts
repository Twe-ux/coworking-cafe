import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, Booking } from "@coworking-cafe/database";
import { connectDB } from "@/lib/db";
import type Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Gérer les événements Stripe (webhooks)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Récupérer le body brut (nécessaire pour signature)
    const body = await request.text();

    // 2. Récupérer la signature du header
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // 3. Vérifier que le webhook secret est configuré
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // 4. Vérifier la signature et construire l'événement
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("[Stripe Webhook] Signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    // 5. Connexion à la base de données
    await connectDB();

    // 6. Gérer les différents types d'événements
    switch (event.type) {
      case "payment_intent.succeeded": {
        try {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);

          // Récupérer la réservation depuis les metadata
          const reservationId = paymentIntent.metadata.reservationId;
          if (!reservationId) {
            console.error("[Stripe Webhook] No reservationId in metadata");
            break;
          }

          // Mettre à jour le booking
          const booking = await Booking.findById(reservationId);
          if (!booking) {
            console.error(`[Stripe Webhook] Booking not found: ${reservationId}`);
            break;
          }

          booking.status = "confirmed";
          await booking.save();

          console.log(`[Stripe Webhook] Booking confirmed: ${reservationId}`);

          // TODO: Envoyer un email de confirmation
          // await sendBookingConfirmationEmail(booking);
        } catch (error) {
          console.error("[Stripe Webhook] Error handling payment_intent.succeeded:", error);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        try {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);

          // Récupérer la réservation depuis les metadata
          const reservationId = paymentIntent.metadata.reservationId;
          if (!reservationId) {
            console.error("[Stripe Webhook] No reservationId in metadata");
            break;
          }

          // Mettre à jour le booking
          const booking = await Booking.findById(reservationId);
          if (!booking) {
            console.error(`[Stripe Webhook] Booking not found: ${reservationId}`);
            break;
          }

          booking.status = "cancelled";
          booking.cancelledAt = new Date();
          booking.cancelReason = "Payment failed";
          await booking.save();

          console.log(`[Stripe Webhook] Booking cancelled due to payment failure: ${reservationId}`);

          // TODO: Envoyer un email d'échec de paiement
          // await sendPaymentFailedEmail(booking);
        } catch (error) {
          console.error("[Stripe Webhook] Error handling payment_intent.payment_failed:", error);
        }
        break;
      }

      case "charge.refunded": {
        try {
          const charge = event.data.object as Stripe.Charge;
          console.log(`[Stripe Webhook] Charge refunded: ${charge.id}`);

          // Récupérer le payment intent associé
          const paymentIntentId = charge.payment_intent;
          if (!paymentIntentId || typeof paymentIntentId !== "string") {
            console.error("[Stripe Webhook] No payment_intent in charge");
            break;
          }

          // Récupérer le payment intent pour avoir les metadata
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const reservationId = paymentIntent.metadata.reservationId;

          if (!reservationId) {
            console.error("[Stripe Webhook] No reservationId in payment intent metadata");
            break;
          }

          // Mettre à jour le booking
          const booking = await Booking.findById(reservationId);
          if (!booking) {
            console.error(`[Stripe Webhook] Booking not found: ${reservationId}`);
            break;
          }

          booking.status = "cancelled";
          booking.cancelledAt = new Date();
          booking.cancelReason = "Payment refunded";
          await booking.save();

          console.log(`[Stripe Webhook] Booking cancelled due to refund: ${reservationId}`);

          // TODO: Envoyer un email de remboursement
          // await sendRefundEmail(booking);
        } catch (error) {
          console.error("[Stripe Webhook] Error handling charge.refunded:", error);
        }
        break;
      }

      default:
        // Événement non géré, juste logger
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // 7. Retourner une réponse de succès
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
