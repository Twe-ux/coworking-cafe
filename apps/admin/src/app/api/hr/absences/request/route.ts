import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import Absence from '@/models/absence';
import Employee from '@/models/employee';

interface CreateAbsenceRequestWithPin {
  employeeId: string;
  pin: string;
  type: 'unavailability' | 'paid_leave';
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * POST /api/hr/absences/request
 * 🔓 ROUTE PUBLIQUE - Créer une demande d'absence avec vérification PIN
 * Utilisée par les staff non connectés via le modal de demande
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: CreateAbsenceRequestWithPin = await request.json();

    // Validation
    if (
      !body.employeeId ||
      !body.pin ||
      !body.type ||
      !body.startDate ||
      !body.endDate
    ) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['unavailability', 'paid_leave'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'Type d\'absence invalide' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Format de date invalide' },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { success: false, error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(body.pin)) {
      return NextResponse.json(
        { success: false, error: 'Le PIN doit être composé de 4 chiffres' },
        { status: 400 }
      );
    }

    await connectMongoose();

    // Step 1: Verify employee and PIN
    const employee = await Employee.findById(body.employeeId);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé introuvable' },
        { status: 404 }
      );
    }

    if (!employee.isActive) {
      return NextResponse.json(
        { success: false, error: 'Employé inactif' },
        { status: 403 }
      );
    }

    // Verify PIN using employee method
    const isPinValid = employee.verifyPin(body.pin);

    if (!isPinValid) {
      return NextResponse.json(
        { success: false, error: 'Code PIN incorrect' },
        { status: 401 }
      );
    }

    // Step 2: Calculate affected shifts
    // Get all business days (Monday-Saturday, exclude Sunday)
    const businessDays: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const dateStr = currentDate.toISOString().split('T')[0];

      if (!isSunday) {
        businessDays.push(dateStr);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate hours based on absence type
    let totalHours: number;
    let hoursPerDay: number;

    if (body.type === 'paid_leave') {
      // CP: Use French legal formula (independent of planning)
      totalHours = (businessDays.length / 6) * employee.contractualHours;
      hoursPerDay = businessDays.length > 0 ? totalHours / businessDays.length : 0;
    } else {
      // Unavailability: 0 hours (unpaid, no hours tracked)
      totalHours = 0;
      hoursPerDay = 0;
    }

    // Create affected shifts array
    const affectedShifts = businessDays.map(dateStr => ({
      date: dateStr,
      shiftNumber: 1 as const,
      scheduledHours: hoursPerDay,
    }));

    // Step 3: Create absence
    const absence = new Absence({
      employeeId: body.employeeId,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason || undefined,
      status: 'pending',
      affectedShifts,
      totalHours,
      paidHours: 0,
      isActive: true,
    });

    await absence.save();

    return NextResponse.json(
      {
        success: true,
        data: absence,
        message: 'Demande d\'absence créée avec succès',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating absence request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de la demande',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
