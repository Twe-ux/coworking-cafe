import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { TimeEntry } from '@/models/timeEntry';

/**
 * PUT /api/hr/time-entries/[id]
 * Modifie un time entry existant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { clockIn, clockOut, status } = body;

    // Trouver le time entry
    const timeEntry = await TimeEntry.findById(id);

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour les champs
    if (clockIn) {
      timeEntry.clockIn = new Date(clockIn);
    }

    if (clockOut !== undefined) {
      if (clockOut === null) {
        timeEntry.clockOut = null;
        timeEntry.status = 'active';
        timeEntry.totalHours = undefined;
      } else {
        timeEntry.clockOut = new Date(clockOut);

        // Validation
        if (timeEntry.clockOut <= timeEntry.clockIn) {
          return NextResponse.json(
            { error: "L'heure de sortie doit être postérieure à l'heure d'entrée" },
            { status: 400 }
          );
        }

        // Calculer les heures
        const durationMs = timeEntry.clockOut.getTime() - timeEntry.clockIn.getTime();
        const hours = durationMs / (1000 * 60 * 60);
        timeEntry.totalHours = Math.round(hours * 100) / 100;
        timeEntry.status = 'completed';
      }
    }

    if (status) {
      timeEntry.status = status;
    }

    await timeEntry.save();

    // Recharger avec les données de l'employé
    await timeEntry.populate('employeeId', 'firstName lastName employeeRole');

    return NextResponse.json({
      success: true,
      message: 'Time entry modifié',
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
        error: 'Erreur lors de la modification',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/time-entries/[id]
 * Supprime (désactive) un time entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    // Soft delete - désactiver plutôt que supprimer
    const timeEntry = await TimeEntry.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Time entry supprimé',
    });

  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression',
        details: error.message
      },
      { status: 500 }
    );
  }
}
