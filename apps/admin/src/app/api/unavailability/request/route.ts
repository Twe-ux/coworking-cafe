import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import Unavailability from '@/models/unavailability';
import Employee from '@/models/employee';

/**
 * POST /api/unavailability/request - Staff request for unavailability (with PIN)
 * Public endpoint - no auth required (PIN verification instead)
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    await connectMongoose();

    const body = await request.json();
    const { employeeId, pin, startDate, endDate, reason, type } = body;

    if (!employeeId || !pin || !startDate || !endDate || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données manquantes',
          details: 'employeeId, pin, startDate, endDate, type sont requis',
        },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé introuvable' },
        { status: 404 }
      );
    }

    if (!employee.clockingCode || employee.clockingCode !== pin) {
      return NextResponse.json(
        { success: false, error: 'Code PIN invalide' },
        { status: 401 }
      );
    }

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le motif de la demande doit contenir au moins 10 caractères',
        },
        { status: 400 }
      );
    }

    const unavailabilityData = {
      employeeId,
      startDate,
      endDate,
      reason: reason.trim(),
      type,
      status: 'pending',
      requestedBy: 'employee',
      notificationSent: false,
    };

    const newUnavailability = new Unavailability(unavailabilityData);
    await newUnavailability.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Demande d\'indisponibilité envoyée avec succès',
        data: {
          _id: newUnavailability._id.toString(),
          status: newUnavailability.status,
          startDate: newUnavailability.startDate,
          endDate: newUnavailability.endDate,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Erreur API POST unavailability/request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de la demande',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
