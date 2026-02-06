import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectToDatabase } from '@/lib/mongodb'
import TimeEntry from '@/models/timeEntry'
import type {
  TimeEntryFilter,
  PaginatedResponse,
  TimeEntry as TimeEntryType,
  ApiResponse,
} from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'
import type { Types } from 'mongoose'

// Interfaces pour les documents MongoDB populés
interface PopulatedEmployee {
  _id: Types.ObjectId | string
  firstName: string
  lastName: string
  employeeRole: string
  color?: string
}

interface TimeEntryDocument {
  _id: Types.ObjectId
  employeeId: PopulatedEmployee | Types.ObjectId
  date: string
  clockIn: string
  clockOut?: string | null
  shiftNumber: 1 | 2
  totalHours?: number
  status: 'active' | 'completed'
  hasError?: boolean
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY'
  errorMessage?: string
  isOutOfSchedule?: boolean
  justificationNote?: string
  justificationRead?: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/time-entries - Récupérer les time entries avec filtres et pagination
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // GET en lecture seule est PUBLIC pour permettre l'affichage du pointage staff
    // Pas besoin d'auth pour lire les time entries (données publiques limitées)
    // L'écriture (POST/PUT/DELETE) reste protégée

    const userRole = session?.user?.role
    if (session?.user?.id) {
      console.log('🔍 DEBUG API time-entries - User role:', userRole, 'Session user:', session?.user)
    } else {
      console.log('🔍 DEBUG API time-entries - Accès public (pas de session)')
    }

    await connectToDatabase()

    // Extraction des paramètres de recherche
    const { searchParams } = new URL(request.url)

    const filters: TimeEntryFilter = {
      employeeId: searchParams.get('employeeId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status:
        (searchParams.get('status') as 'active' | 'completed') || undefined,
      shiftNumber: searchParams.get('shiftNumber')
        ? (parseInt(searchParams.get('shiftNumber')!) as 1 | 2)
        : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    }

    // Validation des paramètres
    if (filters.page && filters.page < 1) filters.page = 1
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) filters.limit = 50

    // Construction de la requête MongoDB
    interface MongoQuery {
      isActive: boolean
      employeeId?: string
      status?: 'active' | 'completed'
      shiftNumber?: 1 | 2
      date?: {
        $gte?: string
        $lte?: string
      }
    }

    const query: MongoQuery = { isActive: true }

    if (filters.employeeId) {
      query.employeeId = filters.employeeId
    }

    if (filters.status) {
      query.status = filters.status
    }

    if (filters.shiftNumber) {
      query.shiftNumber = filters.shiftNumber
    }

    // Filtrage par plage de dates
    if (filters.startDate || filters.endDate) {
      query.date = {}
      if (filters.startDate) {
        query.date.$gte = filters.startDate
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate
      }
    }

    // Calcul de la pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 50)

    // Exécution des requêtes en parallèle
    const [timeEntries, totalCount] = await Promise.all([
      TimeEntry.find(query)
        .populate('employeeId', 'firstName lastName employeeRole color')
        .sort({ date: -1, clockIn: -1 })
        .skip(skip)
        .limit(filters.limit || 50)
        .lean(),
      TimeEntry.countDocuments(query),
    ])

    // Formatage des données
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const formattedTimeEntries: TimeEntryType[] = (timeEntries as unknown as TimeEntryDocument[]).map(
      (entry) => {
        const isPopulated =
          entry.employeeId &&
          typeof entry.employeeId === 'object' &&
          '_id' in entry.employeeId

        const populatedEmployee = isPopulated
          ? (entry.employeeId as PopulatedEmployee)
          : null

        const originalEmployeeId = populatedEmployee
          ? typeof populatedEmployee._id === 'string'
            ? populatedEmployee._id
            : populatedEmployee._id.toString()
          : (entry.employeeId as Types.ObjectId).toString()

        // Recalculate hasError for past dates without clockOut
        let hasError = entry.hasError || false
        let errorType = entry.errorType
        let errorMessage = entry.errorMessage

        if (!entry.clockOut && entry.date < today) {
          hasError = true
          errorType = 'MISSING_CLOCK_OUT'
          errorMessage = 'Pointage de sortie manquant pour une journée passée'
        } else if (entry.clockOut || entry.date >= today) {
          hasError = false
          errorType = undefined
          errorMessage = undefined
        }

        return {
          id: entry._id.toString(),
          employeeId: originalEmployeeId,
          employee: populatedEmployee
            ? {
                id:
                  typeof populatedEmployee._id === 'string'
                    ? populatedEmployee._id
                    : populatedEmployee._id.toString(),
                firstName: populatedEmployee.firstName,
                lastName: populatedEmployee.lastName,
                fullName: `${populatedEmployee.firstName} ${populatedEmployee.lastName}`,
                employeeRole: populatedEmployee.employeeRole,
              }
            : undefined,
          date: entry.date,
          clockIn: entry.clockIn,
          clockOut: entry.clockOut,
          shiftNumber: entry.shiftNumber,
          totalHours: entry.totalHours,
          status: entry.status,
          hasError,
          errorType,
          errorMessage,
          isOutOfSchedule: entry.isOutOfSchedule,
          justificationNote: entry.justificationNote,
          justificationRead: entry.justificationRead,
          isActive: entry.isActive,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
          // Calculer la durée actuelle pour les shifts actifs
          currentDuration:
            !entry.clockOut && entry.status === 'active'
              ? Math.max(
                  0,
                  (new Date().getTime() - new Date(entry.clockIn).getTime()) /
                    (1000 * 60 * 60)
                )
              : entry.totalHours || 0,
        }
      }
    )

    // Calcul de la pagination
    const totalPages = Math.ceil(totalCount / (filters.limit || 50))
    const hasNext = (filters.page || 1) < totalPages
    const hasPrev = (filters.page || 1) > 1

    const response: PaginatedResponse<TimeEntryType> = {
      success: true,
      data: formattedTimeEntries,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
      message: `${formattedTimeEntries.length} entrées trouvées`,
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('❌ Erreur API GET time-entries:', error)

    // Gestion des erreurs de date invalide
    if (
      error instanceof Error &&
      (error.message.includes('Invalid Date') || error.name === 'CastError')
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Format de date invalide',
          details: TIME_ENTRY_ERRORS.VALIDATION_ERROR,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la récupération des time entries',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/time-entries - Créer un time entry manuellement (admin/manager uniquement)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Non authentifié',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    // Vérification des permissions (dev ou admin uniquement)
    const userRole = session?.user?.role
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            'Seuls les développeurs et administrateurs peuvent créer des time entries manuellement',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 403 }
      )
    }

    const { employeeId, date, clockIn, clockOut, shiftNumber } =
      await request.json()

    // Validation des données obligatoires
    if (!employeeId || !clockIn) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "ID employé et heure d'arrivée sont obligatoires",
          details: TIME_ENTRY_ERRORS.VALIDATION_ERROR,
        },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Créer les données du time entry
    // date format: "YYYY-MM-DD"
    // clockIn/clockOut format: "HH:mm"
    interface TimeEntryData {
      employeeId: string
      date: string
      clockIn: string
      shiftNumber: 1 | 2
      status: 'active' | 'completed'
      clockOut?: string
    }

    const timeEntryData: TimeEntryData = {
      employeeId,
      date: date || new Date().toISOString().split('T')[0], // Use string format
      clockIn, // Already in "HH:mm" format
      shiftNumber: shiftNumber || 1,
      status: clockOut ? 'completed' : 'active',
    }

    if (clockOut) {
      timeEntryData.clockOut = clockOut // Already in "HH:mm" format
    }

    const newTimeEntry = new TimeEntry(timeEntryData)
    await newTimeEntry.save()

    // Populer les données de l'employé
    await newTimeEntry.populate('employeeId', 'firstName lastName employeeRole')

    // Formater la réponse
    const populatedTimeEntry = newTimeEntry as unknown as TimeEntryDocument

    const isPopulated =
      populatedTimeEntry.employeeId &&
      typeof populatedTimeEntry.employeeId === 'object' &&
      '_id' in populatedTimeEntry.employeeId

    const populatedEmployee = isPopulated
      ? (populatedTimeEntry.employeeId as PopulatedEmployee)
      : null

    const originalEmployeeId = populatedEmployee
      ? typeof populatedEmployee._id === 'string'
        ? populatedEmployee._id
        : populatedEmployee._id.toString()
      : (populatedTimeEntry.employeeId as Types.ObjectId).toString()

    const formattedTimeEntry: TimeEntryType = {
      id: populatedTimeEntry._id.toString(),
      employeeId: originalEmployeeId,
      employee: populatedEmployee
        ? {
            id:
              typeof populatedEmployee._id === 'string'
                ? populatedEmployee._id
                : populatedEmployee._id.toString(),
            firstName: populatedEmployee.firstName,
            lastName: populatedEmployee.lastName,
            fullName: `${populatedEmployee.firstName} ${populatedEmployee.lastName}`,
            employeeRole: populatedEmployee.employeeRole,
          }
        : undefined,
      date: populatedTimeEntry.date,
      clockIn: populatedTimeEntry.clockIn,
      clockOut: populatedTimeEntry.clockOut,
      shiftNumber: populatedTimeEntry.shiftNumber,
      totalHours: populatedTimeEntry.totalHours,
      status: populatedTimeEntry.status,
      hasError: populatedTimeEntry.hasError,
      errorType: populatedTimeEntry.errorType,
      errorMessage: populatedTimeEntry.errorMessage,
      isActive: populatedTimeEntry.isActive,
      createdAt: populatedTimeEntry.createdAt,
      updatedAt: populatedTimeEntry.updatedAt,
    }

    return NextResponse.json<ApiResponse<TimeEntryType>>(
      {
        success: true,
        data: formattedTimeEntry,
        message: 'Time entry créé avec succès',
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('❌ Erreur API POST time-entries:', error)

    // Gestion des erreurs de validation Mongoose
    interface MongooseValidationError extends Error {
      name: 'ValidationError'
      errors: Record<string, { message: string }>
    }

    interface MongoDuplicateKeyError extends Error {
      code: number
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as MongooseValidationError
      const validationErrors = Object.values(mongooseError.errors).map(
        (err) => err.message
      )
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Données invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (
      error instanceof Error &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            'Un shift avec ce numéro existe déjà pour cette date et cet employé',
          details: TIME_ENTRY_ERRORS.MAX_SHIFTS_EXCEEDED,
        },
        { status: 409 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la création du time entry',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/time-entries - Gestion CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
