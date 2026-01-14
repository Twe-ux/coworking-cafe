import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { TimeEntry } from '@/models/timeEntry';
import { Employee } from '@/models/employee';
import { getStartOfDay } from '@/lib/utils/time-tracking';

/**
 * POST /api/hr/time-entries/clock-in
 * Pointer l'arrivée d'un employé (démarrer un nouveau shift)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { employeeId, date: customDate } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: "L'ID de l'employé est obligatoire" },
        { status: 400 }
      );
    }

    // Vérifier que l'employé existe
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: 'Employé introuvable' },
        { status: 404 }
      );
    }

    // Utiliser la date fournie ou la date du jour
    const shiftDate = customDate ? new Date(customDate) : new Date();
    const dateOnly = getStartOfDay(shiftDate);

    // Vérifier le nombre de shifts existants pour ce jour
    const existingShiftsCount = await TimeEntry.countDocuments({
      employeeId,
      date: dateOnly,
      isActive: true,
    });

    if (existingShiftsCount >= 2) {
      return NextResponse.json(
        { error: 'Limite de 2 shifts par jour atteinte' },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà un shift actif
    const activeShift = await TimeEntry.findOne({
      employeeId,
      status: 'active',
      isActive: true,
    });

    if (activeShift) {
      return NextResponse.json(
        {
          error: 'Un shift est déjà en cours',
          activeShift: {
            _id: activeShift._id,
            clockIn: activeShift.clockIn,
            shiftNumber: activeShift.shiftNumber,
          }
        },
        { status: 400 }
      );
    }

    // Créer le nouveau time entry
    const timeEntry = new TimeEntry({
      employeeId,
      date: dateOnly,
      clockIn: new Date(), // Heure actuelle
      status: 'active',
      isActive: true,
    });

    await timeEntry.save();

    // Peupler les données de l'employé
    await timeEntry.populate('employeeId', 'firstName lastName employeeRole');

    return NextResponse.json({
      success: true,
      message: 'Pointage d\'arrivée enregistré',
      timeEntry: {
        _id: timeEntry._id,
        employeeId: timeEntry.employeeId,
        date: timeEntry.date,
        clockIn: timeEntry.clockIn,
        shiftNumber: timeEntry.shiftNumber,
        status: timeEntry.status,
        createdAt: timeEntry.createdAt,
      },
    }, { status: 201 });

  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Erreur lors du pointage d\'arrivée',
        details: error.message
      },
      { status: 500 }
    );
  }
}
