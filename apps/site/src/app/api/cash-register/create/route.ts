import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CashRegister } from '@coworking-cafe/database';
import { handleApiError } from '@/lib/api-helpers';
import type { CreateCashRegisterPayload } from '@/types/cashRegister';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/cash-register/create
 * Create a new cash register entry
 * PUBLIC - No authentication required (staff access)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: CreateCashRegisterPayload = await request.json();
    const { date, amount, countedBy, countDetails, notes } = body;

    // Validation
    if (!date || !amount || !countedBy) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide (YYYY-MM-DD requis)' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide' },
        { status: 400 }
      );
    }

    // Validate countedBy
    if (!countedBy.userId || !countedBy.name) {
      return NextResponse.json(
        { success: false, error: 'Informations employé manquantes' },
        { status: 400 }
      );
    }

    // Create cash register entry
    const cashRegister = await CashRegister.create({
      date,
      amount,
      countedBy,
      countDetails,
      notes
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: cashRegister._id.toString(),
        date: cashRegister.date,
        amount: cashRegister.amount,
        countedBy: cashRegister.countedBy,
        countDetails: cashRegister.countDetails,
        notes: cashRegister.notes,
        createdAt: cashRegister.createdAt,
        updatedAt: cashRegister.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating cash register entry:', error);
    return handleApiError(error);
  }
}
