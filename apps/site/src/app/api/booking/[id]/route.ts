/**
 * API Route: GET /api/booking/[id]
 * Récupérer les détails d'une réservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Booking } from '@coworking-cafe/database';
import type { ApiResponse, ReservationDetails } from '@/types';

/**
 * GET /api/booking/[id]
 * Récupérer une réservation par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<ReservationDetails>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour consulter cette réservation.' },
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
    const booking = await Booking.findById(bookingId)
      .populate('spaceId', 'name type capacity pricePerHour')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Réservation introuvable.' },
        { status: 404 }
      );
    }

    // 4. VÉRIFIER QUE L'UTILISATEUR EST LE PROPRIÉTAIRE
    // (ou admin - à implémenter si nécessaire)
    if (booking.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas autorisé à consulter cette réservation.' },
        { status: 403 }
      );
    }

    // 5. FORMATER LA RÉPONSE
    const response: ReservationDetails = {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      spaceId: booking.spaceId._id.toString(),
      spaceName: booking.spaceId.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfPeople: booking.numberOfPeople,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentIntentId: booking.paymentIntentId,
      specialRequests: booking.specialRequests,
      promoCode: booking.promoCode,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération de la réservation.',
      },
      { status: 500 }
    );
  }
}
