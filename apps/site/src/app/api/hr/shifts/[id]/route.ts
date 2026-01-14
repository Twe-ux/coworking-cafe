import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { Shift } from '@/models/shift';

/**
 * GET /api/hr/shifts/[id]
 * Récupère un shift spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const shift = await Shift.findById(params.id).populate(
      'employeeId',
      'firstName lastName email employeeRole'
    );

    if (!shift) {
      return NextResponse.json({ error: 'Shift introuvable' }, { status: 404 });
    }

    return NextResponse.json({ shift }, { status: 200 });
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération du shift' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/hr/shifts/[id]
 * Met à jour un shift existant
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

    const body = await request.json();
    const { date, startTime, endTime } = body;

    // Vérifier que le shift existe
    const shift = await Shift.findById(params.id);
    if (!shift) {
      return NextResponse.json({ error: 'Shift introuvable' }, { status: 404 });
    }

    // Si les horaires changent, vérifier les conflits
    if (startTime || endTime || date) {
      const newStartTime = startTime || shift.startTime;
      const newEndTime = endTime || shift.endTime;
      const newDate = date ? new Date(date) : shift.date;

      // Récupérer les autres shifts du même employé à cette date
      const existingShifts = await Shift.find({
        employeeId: shift.employeeId,
        _id: { $ne: shift._id }, // Exclure le shift actuel
        date: {
          $gte: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
          $lt: new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate() + 1),
        },
        isActive: true,
      });

      // Vérifier les chevauchements
      const start1 = new Date(`2000-01-01 ${newStartTime}`);
      let end1 = new Date(`2000-01-01 ${newEndTime}`);
      if (end1 <= start1) {
        end1.setDate(end1.getDate() + 1);
      }

      for (const existingShift of existingShifts) {
        const start2 = new Date(`2000-01-01 ${existingShift.startTime}`);
        let end2 = new Date(`2000-01-01 ${existingShift.endTime}`);
        if (end2 <= start2) {
          end2.setDate(end2.getDate() + 1);
        }

        // Vérifier le chevauchement
        if (start1 < end2 && end1 > start2) {
          return NextResponse.json(
            {
              error: 'Ce créneau se chevauche avec un shift existant',
              conflictingShift: existingShift,
            },
            { status: 409 }
          );
        }
      }
    }

    // Mettre à jour le shift
    const updatedShift = await Shift.findByIdAndUpdate(
      params.id,
      {
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      },
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName email employeeRole');

    return NextResponse.json({ shift: updatedShift }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Données de shift invalides', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du shift' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/shifts/[id]
 * Supprime (désactive) un shift
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

    // Soft delete : on marque le shift comme inactif
    const shift = await Shift.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!shift) {
      return NextResponse.json({ error: 'Shift introuvable' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Shift supprimé avec succès', shift },
      { status: 200 }
    );
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du shift' },
      { status: 500 }
    );
  }
}
