/**
 * API Route: POST /api/booking/calculate
 * Calcul du prix d'une réservation (côté serveur)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Booking, Space, PromoConfig } from '@coworking-cafe/database';
import type { ApiResponse, CalculatePriceResponse } from '@/types';

/**
 * Données de la requête
 */
interface CalculateRequest {
  spaceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  promoCode?: string;
}

/**
 * Calculer la différence en heures entre deux horaires
 */
function calculateHours(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * POST /api/booking/calculate
 * Calculer le prix d'une réservation et vérifier la disponibilité
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<CalculatePriceResponse>>> {
  try {
    const body: CalculateRequest = await request.json();
    const { spaceId, date, startTime, endTime, numberOfPeople, promoCode } = body;

    // 1. VALIDATION DES DONNÉES
    if (!spaceId || !date || !startTime || !endTime || !numberOfPeople) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données manquantes. Veuillez remplir tous les champs requis.',
        },
        { status: 400 }
      );
    }

    // Validation format date (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide. Utilisez YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    // Validation format time (HH:mm)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTime)) {
      return NextResponse.json(
        { success: false, error: 'Format d\'heure invalide. Utilisez HH:mm.' },
        { status: 400 }
      );
    }

    // Validation plage horaire
    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, error: 'L\'heure de fin doit être après l\'heure de début.' },
        { status: 400 }
      );
    }

    // Validation nombre de personnes
    if (numberOfPeople < 1 || !Number.isInteger(numberOfPeople)) {
      return NextResponse.json(
        { success: false, error: 'Le nombre de personnes doit être au moins 1.' },
        { status: 400 }
      );
    }

    // 2. VÉRIFIER QUE L'ESPACE EXISTE
    const space = await Space.findById(spaceId).lean();

    if (!space || !space.isActive) {
      return NextResponse.json(
        { success: false, error: 'Espace non disponible ou inexistant.' },
        { status: 404 }
      );
    }

    // 3. VÉRIFIER LA CAPACITÉ
    if (numberOfPeople > space.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: `Capacité maximale dépassée. Cet espace peut accueillir jusqu'à ${space.capacity} personnes.`,
        },
        { status: 400 }
      );
    }

    // 4. VÉRIFIER LA DISPONIBILITÉ (pas de réservation existante)
    const existingBooking = await Booking.findOne({
      spaceId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        // Cas 1: Nouvelle réservation commence pendant une réservation existante
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        // Cas 2: Nouvelle réservation finit pendant une réservation existante
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        // Cas 3: Nouvelle réservation englobe une réservation existante
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    }).lean();

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cet espace est déjà réservé sur ce créneau horaire. Veuillez choisir un autre horaire.',
        },
        { status: 409 }
      );
    }

    // 5. CALCULER LE PRIX
    const hours = calculateHours(startTime, endTime);
    const basePrice = space.pricePerHour * hours;

    let discount = 0;
    let promoDetails = null;

    // 6. APPLIQUER CODE PROMO (si fourni)
    if (promoCode) {
      const promo = await PromoConfig.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      }).lean();

      if (promo) {
        // Calculer la réduction selon le type
        if (promo.discountType === 'percentage') {
          discount = (basePrice * promo.discountValue) / 100;
        } else if (promo.discountType === 'fixed') {
          discount = promo.discountValue;
        }

        promoDetails = {
          code: promo.code,
          description: promo.description,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
        };
      } else {
        // Code promo invalide ou expiré (ne pas bloquer, juste ignorer)
        console.warn(`Invalid or expired promo code: ${promoCode}`);
      }
    }

    // Prix final (minimum 0)
    const totalPrice = Math.max(0, basePrice - discount);

    // 7. RETOURNER LES DÉTAILS
    const response: CalculatePriceResponse = {
      available: true,
      space: {
        id: space._id.toString(),
        name: space.name,
        pricePerHour: space.pricePerHour,
      },
      booking: {
        date,
        startTime,
        endTime,
        numberOfPeople,
        hours,
      },
      pricing: {
        basePrice: Math.round(basePrice * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
        hours,
        promo: promoDetails,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error calculating booking price:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors du calcul du prix. Veuillez réessayer.',
      },
      { status: 500 }
    );
  }
}
