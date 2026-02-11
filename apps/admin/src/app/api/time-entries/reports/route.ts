import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectMongoose } from '@/lib/mongodb'
import TimeEntry from '@/models/timeEntry'
import type { ApiResponse, DailyTimeReport, TimeTrackingStats, EmployeeTimeReport } from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'

/**
 * GET /api/time-entries/reports - Générer des rapports de temps de travail
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id && process.env.NODE_ENV !== 'development') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Non authentifié',
        details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
      }, { status: 401 })
    }

    const userRole = session?.user?.role
    if (
      !userRole ||
      (!['admin', 'manager'].includes(userRole) &&
        process.env.NODE_ENV !== 'development')
    ) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Seuls les administrateurs et managers peuvent accéder aux rapports',
        details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
      }, { status: 403 })
    }

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'daily'
    const date = searchParams.get('date')
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    switch (reportType) {
      case 'daily':
        return await generateDailyReport(date)
      case 'employee-stats':
        return await generateEmployeeStats(employeeId, startDate, endDate)
      case 'summary':
        return await generateSummaryStats(startDate, endDate)
      default:
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: 'Type de rapport non supporté',
          details: 'Types disponibles: daily, employee-stats, summary',
        }, { status: 400 })
    }

  } catch (error: unknown) {
    console.error('❌ Erreur API GET time-entries/reports:', error)

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur lors de la génération du rapport',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

async function generateDailyReport(dateParam?: string | null): Promise<NextResponse> {
  const targetDate = dateParam ? new Date(dateParam) : new Date()

  try {
    const report = await (TimeEntry as unknown as { getDailyReport: (date: Date) => Promise<EmployeeTimeReport[]> }).getDailyReport(targetDate)

    const dailyReport: DailyTimeReport = {
      date: targetDate,
      employees: report,
      totalActiveShifts: report.reduce((sum: number, emp: EmployeeTimeReport) => sum + emp.activeShifts, 0),
      totalCompletedShifts: report.reduce((sum: number, emp: EmployeeTimeReport) => sum + (emp.shifts.length - emp.activeShifts), 0),
      totalHoursWorked: report.reduce((sum: number, emp: EmployeeTimeReport) => sum + emp.totalHours, 0),
    }

    return NextResponse.json<ApiResponse<DailyTimeReport>>({
      success: true,
      data: dailyReport,
      message: `Rapport journalier pour le ${targetDate.toLocaleDateString('fr-FR')}`,
    })
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur lors de la génération du rapport journalier',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

async function generateEmployeeStats(
  employeeId?: string | null,
  startDateParam?: string | null,
  endDateParam?: string | null
): Promise<NextResponse> {
  if (!employeeId) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'ID employé requis pour les statistiques employé',
      details: TIME_ENTRY_ERRORS.VALIDATION_ERROR,
    }, { status: 400 })
  }

  const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
  const endDate = endDateParam ? new Date(endDateParam) : new Date()

  try {
    interface EmployeeHoursResult {
      totalHours: number
      totalShifts: number
      averageHoursPerShift: number
    }

    const [statsResult] = await (TimeEntry as unknown as {
      getEmployeeHours: (employeeId: string, startDate: Date, endDate: Date) => Promise<EmployeeHoursResult[]>
    }).getEmployeeHours(employeeId, startDate, endDate)

    // Compter les shifts actifs
    const activeShifts = await TimeEntry.countDocuments({
      employeeId,
      status: 'active',
      isActive: true,
    })

    const stats: TimeTrackingStats = {
      totalHours: statsResult?.totalHours || 0,
      totalShifts: statsResult?.totalShifts || 0,
      averageHoursPerShift: statsResult?.averageHoursPerShift || 0,
      activeShifts,
      completedShifts: (statsResult?.totalShifts || 0) - activeShifts,
    }

    return NextResponse.json<ApiResponse<TimeTrackingStats>>({
      success: true,
      data: stats,
      message: `Statistiques pour l'employé du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
    })
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur lors de la génération des statistiques employé',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

async function generateSummaryStats(
  startDateParam?: string | null,
  endDateParam?: string | null
): Promise<NextResponse> {
  const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 jours par défaut
  const endDate = endDateParam ? new Date(endDateParam) : new Date()

  try {
    interface AggregateResult {
      _id: null
      totalHours: number
      totalShifts: number
      activeShifts: number
      completedShifts: number
      averageHoursPerShift: number
    }

    const aggregateResults = await TimeEntry.aggregate<AggregateResult>([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: { $ifNull: ['$totalHours', 0] },
          },
          totalShifts: { $sum: 1 },
          activeShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          averageHoursPerShift: {
            $avg: { $ifNull: ['$totalHours', 0] },
          },
        },
      },
    ])

    const summaryStats = aggregateResults[0]

    const stats: TimeTrackingStats = summaryStats || {
      totalHours: 0,
      totalShifts: 0,
      averageHoursPerShift: 0,
      activeShifts: 0,
      completedShifts: 0,
    }

    return NextResponse.json<ApiResponse<TimeTrackingStats>>({
      success: true,
      data: stats,
      message: `Statistiques résumées du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
    })
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Erreur lors de la génération des statistiques résumées',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    }, { status: 500 })
  }
}

/**
 * OPTIONS /api/time-entries/reports - Gestion CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}