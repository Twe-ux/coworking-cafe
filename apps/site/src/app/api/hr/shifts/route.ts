import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { Shift } from '@/models/shift';
import { Employee } from '@/models/employee';

/**
 * GET /api/hr/shifts
 * Récupère la liste des shifts avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date');

    // Construire le filtre
    const filter: any = { isActive: true };

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (date) {
      // Recherche pour une date spécifique
      const targetDate = new Date(date);
      filter.date = {
        $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      };
    } else if (startDate && endDate) {
      // Recherche pour une plage de dates
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const shifts = await Shift.find(filter)
      .populate('employeeId', 'firstName lastName email employeeRole')
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({ shifts }, { status: 200 });
  } catch (error) {    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des shifts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/shifts
 * Crée un nouveau shift
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { employeeId, date, startTime, endTime } = body;

    // Validation des champs requis
    if (!employeeId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
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

    // Vérifier les conflits avec les shifts existants
    const shiftDate = new Date(date);
    const existingShifts = await Shift.find({
      employeeId,
      date: {
        $gte: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate()),
        $lt: new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate() + 1),
      },
      isActive: true,
    });

    // Vérifier les chevauchements d'horaires
    const start1 = new Date(`2000-01-01 ${startTime}`);
    let end1 = new Date(`2000-01-01 ${endTime}`);
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

    // Créer le shift
    const shift = await Shift.create({
      employeeId,
      date: shiftDate,
      startTime,
      endTime,
    });

    const populatedShift = await Shift.findById(shift._id).populate(
      'employeeId',
      'firstName lastName email employeeRole'
    );

    return NextResponse.json({ shift: populatedShift }, { status: 201 });
  } catch (error: any) {
    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Données de shift invalides', details: error.message },
        { status: 400 }
      );
    }

    // Gérer les erreurs de duplication (index unique)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Un shift existe déjà pour cet employé à cette date et heure' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du shift' },
      { status: 500 }
    );
  }
}
