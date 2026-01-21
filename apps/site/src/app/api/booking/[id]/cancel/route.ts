/**
 * API Route: POST /api/booking/[id]/cancel
 * Annuler une réservation et créer un remboursement Stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Booking } from '@coworking-cafe/database';
import { stripe } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types';

/**
 * Vérifier si une date est dans le passé
 */
function isPastDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * POST /api/booking/[id]/cancel
 * Annuler une réservation avec remboursement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour annuler une réservation.' },
        { status: 401 }
      );
    }

    const bookingId = params.id;

    // 2. VALIDATION ID
    if (!bookingId || bookingId.length !== 24) {
      return NextResponse.json(
        { success: false, error: 'ID de réservation invalide.' },
        { status: 400 }
      );
    }

    // 3. RÉCUPÉRER LA RÉSERVATION
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    // 4. VÉRIFIER QUE L'UTILISATEUR EST LE PROPRIÉTAIRE
    if (booking.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas autorisé à annuler cette réservation.' },
        { status: 403 }
      );
    }

    // 5. VÉRIFIER LE STATUT DE LA RÉSERVATION
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cette réservation est déjà annulée.' },
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Impossible d\'annuler une réservation terminée.' },
        { status: 400 }
      );
    }

    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Cette réservation ne peut pas être annulée.' },
        { status: 400 }
      );
    }

    // 6. VÉRIFIER SI LA DATE N'EST PAS DANS LE PASSÉ
    if (isPastDate(booking.date)) {
      return NextResponse.json(
        { success: false, error: 'Impossible d\'annuler une réservation passée.' },
        { status: 400 }
      );
    }

    // 7. CRÉER LE REMBOURSEMENT STRIPE (si payment intent existe)
    if (booking.paymentIntentId) {
      try {
        // Récupérer le Payment Intent pour vérifier son statut
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

        // Ne créer un refund que si le paiement a réussi
        if (paymentIntent.status === 'succeeded') {
          await stripe.refunds.create({
            payment_intent: booking.paymentIntentId,
            reason: 'requested_by_customer',
          });

          console.log(`Refund created for booking ${bookingId}`);
        } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
          // Si le paiement n'a pas encore abouti, annuler le Payment Intent
          await stripe.paymentIntents.cancel(booking.paymentIntentId);
          console.log(`Payment Intent cancelled for booking ${bookingId}`);
        }
      } catch (stripeError) {
        console.error('Error processing Stripe refund:', stripeError);

        // Ne pas bloquer l'annulation si Stripe échoue
        // Log l'erreur et continuer (manuel refund si nécessaire)
        console.warn(`Failed to process Stripe refund for booking ${bookingId}. Manual refund may be needed.`);
      }
    }

    // 8. METTRE À JOUR LA RÉSERVATION
    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Réservation annulée avec succès. Un remboursement sera effectué sous 5-10 jours ouvrés.',
      },
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de l\'annulation de la réservation. Veuillez réessayer ou contacter le support.',
      },
      { status: 500 }
    );
  }
}
