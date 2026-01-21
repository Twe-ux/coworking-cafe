/**
 * API Route: GET /api/user/bookings
 * Récupérer l'historique des réservations de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Booking } from '@coworking-cafe/database';
import type { ApiResponse, PaginatedResult, ReservationDetails } from '@/types';

/**
 * GET /api/user/bookings
 * Liste des réservations avec pagination et filtres
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<PaginatedResult<ReservationDetails>>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour consulter vos réservations.' },
        { status: 401 }
      );
    }

    // 2. RÉCUPÉRER LES PARAMÈTRES DE QUERY
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status'); // 'upcoming', 'past', 'cancelled'

    // Validation pagination
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Paramètres de pagination invalides.' },
        { status: 400 }
      );
    }

    // 3. CONSTRUIRE LE FILTRE
    const filter: Record<string, unknown> = {
      userId: session.user.id,
    };

    // Filtrer par statut
    if (status === 'upcoming') {
      filter.status = { $in: ['pending', 'confirmed'] };
      filter.date = { $gte: new Date().toISOString().split('T')[0] };
    } else if (status === 'past') {
      filter.status = 'completed';
    } else if (status === 'cancelled') {
      filter.status = 'cancelled';
    }

    // 4. COMPTER LE TOTAL
    const total = await Booking.countDocuments(filter);

    // 5. RÉCUPÉRER LES RÉSERVATIONS PAGINÉES
    const skip = (page - 1) * pageSize;

    const bookings = await Booking.find(filter)
      .populate('spaceId', 'name type capacity pricePerHour')
      .sort({ date: -1, createdAt: -1 }) // Plus récentes en premier
      .skip(skip)
      .limit(pageSize)
      .lean();

    // 6. FORMATER LES RÉSULTATS
    const items: ReservationDetails[] = bookings.map((booking) => ({
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
    }));

    // 7. CALCULER LA PAGINATION
    const totalPages = Math.ceil(total / pageSize);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const result: PaginatedResult<ReservationDetails> = {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext,
      hasPrevious,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération des réservations.',
      },
      { status: 500 }
    );
  }
}
