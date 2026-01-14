import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { TimeEntry } from '@/models/timeEntry';
import { getStartOfDay, getEndOfDay } from '@/lib/utils/time-tracking';

/**
 * GET /api/hr/time-entries
 * Récupère la liste des time entries (pointages) avec filtres optionnels
 *
 * Query params:
 * - employeeId: Filtrer par employé
 * - startDate: Date de début (format YYYY-MM-DD)
 * - endDate: Date de fin (format YYYY-MM-DD)
 * - status: Filtrer par statut ('active' ou 'completed')
 * - date: Date spécifique (format YYYY-MM-DD)
 * - hasError: Filtrer les entrées avec erreurs (true/false)
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
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const hasError = searchParams.get('hasError');

    // Construire le filtre
    const filter: any = { isActive: true };

    if (employeeId) {
      filter.employeeId = employeeId;
    }

    if (status) {
      filter.status = status;
    }

    if (hasError !== null) {
      filter.hasError = hasError === 'true';
    }

    // Filtre par date
    if (date) {
      // Date spécifique
      const targetDate = new Date(date);
      filter.date = getStartOfDay(targetDate);
    } else if (startDate && endDate) {
      // Plage de dates (du 1er au dernier jour à 100%)
      filter.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: getEndOfDay(new Date(endDate)),
      };
    }

    // Récupérer les time entries avec les données de l'employé
    const timeEntries = await TimeEntry.find(filter)
      .populate('employeeId', 'firstName lastName employeeRole')
      .sort({ date: -1, clockIn: -1 }) // Plus récents en premier
      .lean();

    // Ajouter les anomalies détectées
    const timeEntriesWithAnomalies = timeEntries.map((entry: any) => {
      const anomalies: string[] = [];

      // Shift actif depuis trop longtemps
      if (entry.status === 'active' && entry.clockIn) {
        const hoursSinceClockIn = (Date.now() - new Date(entry.clockIn).getTime()) / (1000 * 60 * 60);
        if (hoursSinceClockIn > 12) {
          anomalies.push('Shift actif depuis plus de 12h');
        }
      }

      // Shift très long ou très court
      if (entry.totalHours) {
        if (entry.totalHours > 10) {
          anomalies.push(`Shift très long (${entry.totalHours.toFixed(2)}h)`);
        } else if (entry.totalHours < 2) {
          anomalies.push(`Shift très court (${entry.totalHours.toFixed(2)}h)`);
        }
      }

      // Erreurs enregistrées
      if (entry.hasError && entry.errorMessage) {
        anomalies.push(entry.errorMessage);
      }

      return {
        ...entry,
        _id: entry._id.toString(),
        employeeId: {
          ...entry.employeeId,
          _id: entry.employeeId._id.toString(),
        },
        anomalies,
      };
    });

    return NextResponse.json({
      success: true,
      count: timeEntriesWithAnomalies.length,
      timeEntries: timeEntriesWithAnomalies,
    });

  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des pointages',
        details: error.message
      },
      { status: 500 }
    );
  }
}
