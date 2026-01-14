import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/db';
import { TimeEntry } from '@/models/timeEntry';
import { Employee } from '@/models/employee';
import { getStartOfDay, getEndOfDay } from '@/lib/utils/time-tracking';
import mongoose from 'mongoose';

/**
 * GET /api/hr/time-entries/stats
 * Récupère les statistiques de pointage pour une période donnée
 *
 * Query params:
 * - startDate: Date de début (format YYYY-MM-DD) - OBLIGATOIRE
 * - endDate: Date de fin (format YYYY-MM-DD) - OBLIGATOIRE
 * - employeeId: Filtrer par employé spécifique (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les paramètres startDate et endDate sont obligatoires' },
        { status: 400 }
      );
    }

    const periodStart = getStartOfDay(new Date(startDate));
    const periodEnd = getEndOfDay(new Date(endDate));

    // Construire le match pour l'agrégation
    const matchStage: any = {
      date: {
        $gte: periodStart,
        $lte: periodEnd,
      },
      isActive: true,
    };

    if (employeeId) {
      matchStage.employeeId = new mongoose.Types.ObjectId(employeeId);
    }

    // Agrégation pour calculer les stats par employé
    const stats = await TimeEntry.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      {
        $unwind: '$employee',
      },
      {
        $group: {
          _id: '$employeeId',
          employee: { $first: '$employee' },
          totalHours: {
            $sum: { $ifNull: ['$totalHours', 0] },
          },
          totalShifts: { $sum: 1 },
          completedShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
            },
          },
          activeShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
            },
          },
          shiftsWithErrors: {
            $sum: {
              $cond: ['$hasError', 1, 0],
            },
          },
          averageHoursPerShift: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$totalHours',
                null,
              ],
            },
          },
        },
      },
      {
        $sort: {
          'employee.firstName': 1,
          'employee.lastName': 1,
        },
      },
    ]);

    // Formater les résultats
    const formattedStats = stats.map((stat) => ({
      employeeId: stat._id.toString(),
      employee: {
        _id: stat.employee._id.toString(),
        firstName: stat.employee.firstName,
        lastName: stat.employee.lastName,
        employeeRole: stat.employee.employeeRole,
        contractualHours: stat.employee.contractualHours || 0,
      },
      totalHours: Math.round(stat.totalHours * 100) / 100,
      totalShifts: stat.totalShifts,
      completedShifts: stat.completedShifts,
      activeShifts: stat.activeShifts,
      shiftsWithErrors: stat.shiftsWithErrors,
      averageHoursPerShift: stat.averageHoursPerShift
        ? Math.round(stat.averageHoursPerShift * 100) / 100
        : 0,
    }));

    // Calculer les totaux globaux
    const globalStats = {
      totalEmployees: formattedStats.length,
      totalHours: formattedStats.reduce((sum, s) => sum + s.totalHours, 0),
      totalShifts: formattedStats.reduce((sum, s) => sum + s.totalShifts, 0),
      totalActiveShifts: formattedStats.reduce((sum, s) => sum + s.activeShifts, 0),
      totalShiftsWithErrors: formattedStats.reduce((sum, s) => sum + s.shiftsWithErrors, 0),
    };

    return NextResponse.json({
      success: true,
      period: {
        startDate: periodStart,
        endDate: periodEnd,
      },
      globalStats,
      employeeStats: formattedStats,
    });

  } catch (error: any) {    return NextResponse.json(
      {
        error: 'Erreur lors du calcul des statistiques',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
