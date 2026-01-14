import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { TimeEntry } from '@/models/timeEntry';

/**
 * POST /api/hr/time-entries/clock-out
 * Pointer le départ d'un employé (terminer le shift en cours)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { timeEntryId, employeeId } = body;

    let timeEntry;

    if (timeEntryId) {
      // Recherche par ID de time entry
      timeEntry = await TimeEntry.findById(timeEntryId);
    } else if (employeeId) {
      // Recherche du shift actif pour cet employé
      timeEntry = await TimeEntry.findOne({
        employeeId,
        status: 'active',
        isActive: true,
      });
    } else {
      return NextResponse.json(
        { error: "L'ID du time entry ou de l'employé est obligatoire" },
        { status: 400 }
      );
    }

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Aucun shift actif trouvé' },
        { status: 404 }
      );
    }

    if (timeEntry.status !== 'active') {
      return NextResponse.json(
        { error: 'Ce shift est déjà terminé' },
        { status: 400 }
      );
    }

    // Utiliser la méthode completeShift du modèle
    await timeEntry.completeShift();

    // Recharger avec les données de l'employé
    await timeEntry.populate('employeeId', 'firstName lastName employeeRole');

    return NextResponse.json({
      success: true,
      message: 'Pointage de départ enregistré',
      timeEntry: {
        _id: timeEntry._id,
        employeeId: timeEntry.employeeId,
        date: timeEntry.date,
        clockIn: timeEntry.clockIn,
        clockOut: timeEntry.clockOut,
        totalHours: timeEntry.totalHours,
        shiftNumber: timeEntry.shiftNumber,
        status: timeEntry.status,
        updatedAt: timeEntry.updatedAt,
      },
    });

  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Erreur lors du pointage de départ',
        details: error.message
      },
      { status: 500 }
    );
  }
}
