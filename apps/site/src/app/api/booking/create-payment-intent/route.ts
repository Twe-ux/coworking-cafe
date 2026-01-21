/**
 * API Route: POST /api/booking/create-payment-intent
 * Créer un Payment Intent Stripe et une réservation (status: pending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Booking } from '@coworking-cafe/database';
import { stripe } from '@coworking-cafe/database';
import type { ApiResponse, CreatePaymentIntentResponse } from '@/types';

/**
 * Données de la requête
 */
interface CreatePaymentIntentRequest {
  spaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  totalPrice: number;
  promoCode?: string;
  specialRequests?: string;
}

/**
 * POST /api/booking/create-payment-intent
 * Créer Payment Intent Stripe + Booking en DB
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CreatePaymentIntentResponse>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous devez être connecté pour effectuer une réservation.',
        },
        { status: 401 }
      );
    }

    const body: CreatePaymentIntentRequest = await request.json();
    const {
      spaceId,
      date,
      startTime,
      endTime,
      numberOfPeople,
      totalPrice,
      promoCode,
      specialRequests,
    } = body;

    // 2. VALIDATION DES DONNÉES
    if (!spaceId || !date || !startTime || !endTime || !numberOfPeople || totalPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes.' },
        { status: 400 }
      );
    }

    if (totalPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Prix invalide.' },
        { status: 400 }
      );
    }

    // 3. VÉRIFIER DISPONIBILITÉ UNE DERNIÈRE FOIS
    // Important: double-check juste avant de créer la réservation
    const existingBooking = await Booking.findOne({
      spaceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    }).lean();

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cet espace vient d\'être réservé par quelqu\'un d\'autre. Veuillez choisir un autre créneau.',
        },
        { status: 409 }
      );
    }

    // 4. CRÉER PAYMENT INTENT STRIPE
    const amountInCents = Math.round(totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: {
        userId: session.user.id,
        spaceId,
        date,
        startTime,
        endTime,
        numberOfPeople: numberOfPeople.toString(),
        promoCode: promoCode || '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 5. CRÉER BOOKING EN DB (status: 'pending')
    const booking = await Booking.create({
      userId: session.user.id,
      spaceId,
      date,
      startTime,
      endTime,
      numberOfPeople,
      totalPrice,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      promoCode: promoCode || undefined,
      specialRequests: specialRequests || undefined,
    });

    // 6. RETOURNER CLIENT SECRET ET BOOKING ID
    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret!,
      bookingId: booking._id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Gestion d'erreurs Stripe spécifiques
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Trop de tentatives. Veuillez réessayer dans quelques instants.',
          },
          { status: 429 }
        );
      }

      if (error.message.includes('card')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Erreur de configuration du paiement. Veuillez contacter le support.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la création du paiement. Veuillez réessayer.',
      },
      { status: 500 }
    );
  }
}
