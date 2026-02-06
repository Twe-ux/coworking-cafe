import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectToDatabase } from '@/lib/mongodb'
import TimeEntry from '@/models/timeEntry'
import type { ApiResponse, TimeEntry as TimeEntryType } from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'

// Type guard pour CastError Mongoose
interface MongooseCastError {
  name: string
  path: string
}

function isCastError(err: unknown): err is MongooseCastError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    err.name === 'CastError' &&
    'path' in err
  )
}

// Interface pour employé populé
interface PopulatedEmployee {
  _id?: { toString(): string }
  firstName: string
  lastName: string
  employeeRole: string
}

/**
 * PUT /api/time-entries/[id]/mark-justification-read
 * Mark justification as read by admin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<TimeEntryType | null>>> {
  try {
    // Auth - admin or dev only
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

    const userRole = session?.user?.role
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Seuls les administrateurs peuvent marquer les justifications comme lues',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 403 }
      )
    }

    await connectToDatabase()

    // Find time entry
    const timeEntry = await TimeEntry.findById(params.id).populate('employeeId', 'firstName lastName employeeRole')

    if (!timeEntry) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Time entry introuvable',
          details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
        },
        { status: 404 }
      )
    }

    // Check if there's a justification to mark as read
    if (!timeEntry.justificationNote) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Aucune justification à marquer comme lue',
        },
        { status: 400 }
      )
    }

    // Mark as read
    timeEntry.justificationRead = true
    await timeEntry.save()

    // Format response
    const populatedEmployee = timeEntry.employeeId as unknown as PopulatedEmployee
    const formattedTimeEntry: TimeEntryType = {
      id: timeEntry._id.toString(),
      employeeId: populatedEmployee._id?.toString() || timeEntry.employeeId.toString(),
      employee: populatedEmployee._id ? {
        id: populatedEmployee._id.toString(),
        firstName: populatedEmployee.firstName,
        lastName: populatedEmployee.lastName,
        fullName: `${populatedEmployee.firstName} ${populatedEmployee.lastName}`,
        employeeRole: populatedEmployee.employeeRole,
      } : undefined,
      date: timeEntry.date,
      clockIn: timeEntry.clockIn,
      clockOut: timeEntry.clockOut,
      shiftNumber: timeEntry.shiftNumber,
      totalHours: timeEntry.totalHours,
      status: timeEntry.status,
      isOutOfSchedule: timeEntry.isOutOfSchedule,
      justificationNote: timeEntry.justificationNote,
      justificationRead: timeEntry.justificationRead,
      isActive: timeEntry.isActive,
      createdAt: timeEntry.createdAt,
      updatedAt: timeEntry.updatedAt,
    }

    return NextResponse.json<ApiResponse<TimeEntryType>>(
      {
        success: true,
        data: formattedTimeEntry,
        message: 'Justification marquée comme lue',
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('❌ Erreur API PUT time-entries/[id]/mark-justification-read:', error)

    if (isCastError(error) && error.path === '_id') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Format d'ID invalide",
          details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Erreur lors de la mise à jour',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la mise à jour',
        details: 'Unknown error',
      },
      { status: 500 }
    )
  }
}
