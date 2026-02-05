import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { connectToDatabase } from '@/lib/mongodb'
import TimeEntry from '@/models/timeEntry'
import { mapTimeEntryToApi, type MappedTimeEntry } from '@/lib/mappers'
import type { TimeEntryUpdate, ApiResponse } from '@/types/timeEntry'
import { TIME_ENTRY_ERRORS } from '@/types/timeEntry'

/** Mongoose error interface */
interface MongooseError extends Error {
  name: string
  path?: string
  errors?: Record<string, { message: string }>
}

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/time-entries/[id] - Récupérer un time entry spécifique
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id && process.env.NODE_ENV !== 'development') {
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
    if (
      !userRole ||
      (!['dev', 'admin', 'staff'].includes(userRole) &&
        process.env.NODE_ENV !== 'development')
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Permissions insuffisantes',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const timeEntry = await TimeEntry.findOne({
      _id: params.id,
      isActive: true,
    })
      .populate('employeeId', 'firstName lastName employeeRole color')
      .lean()

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

    const formattedTimeEntry = mapTimeEntryToApi(timeEntry)

    return NextResponse.json<ApiResponse<MappedTimeEntry>>({
      success: true,
      data: formattedTimeEntry!,
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API GET time-entries/[id]:', err)

    if (err.name === 'CastError' && err.path === '_id') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Format d'ID invalide",
          details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la récupération du time entry',
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/time-entries/[id] - Modifier un time entry (admin/manager uniquement)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const userRole = session.user.role
    if (
      !['dev', 'admin'].includes(userRole) &&
      process.env.NODE_ENV !== 'development'
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            'Seuls les developpeurs et administrateurs peuvent modifier les time entries',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 403 }
      )
    }

    const updates = (await request.json()) as TimeEntryUpdate

    await connectToDatabase()

    const timeEntry = await TimeEntry.findOne({
      _id: params.id,
      isActive: true,
    })

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

    // Build updates object
    const actualUpdates: Partial<TimeEntryUpdate> = {}
    if (updates.clockIn !== undefined) actualUpdates.clockIn = updates.clockIn
    if (updates.clockOut !== undefined) actualUpdates.clockOut = updates.clockOut
    if (updates.totalHours !== undefined) actualUpdates.totalHours = updates.totalHours
    if (updates.status !== undefined) actualUpdates.status = updates.status
    if (updates.justificationNote !== undefined) actualUpdates.justificationNote = updates.justificationNote

    // Handle null clockOut (reset to active)
    if (actualUpdates.clockOut === null) {
      actualUpdates.status = 'active'
      actualUpdates.totalHours = undefined
    }

    // Validate clockOut is different from clockIn
    const finalClockIn = actualUpdates.clockIn || timeEntry.clockIn
    const finalClockOut =
      actualUpdates.clockOut !== undefined
        ? actualUpdates.clockOut
        : timeEntry.clockOut

    if (finalClockOut && finalClockIn) {
      const [inH, inM] = finalClockIn.split(':').map(Number)
      const [outH, outM] = finalClockOut.split(':').map(Number)

      if (inH * 60 + inM === outH * 60 + outM) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "L'heure de sortie doit etre differente de l'heure d'entree",
            details: TIME_ENTRY_ERRORS.INVALID_TIME_RANGE,
          },
          { status: 400 }
        )
      }
    }

    // Apply updates to document
    if (actualUpdates.clockIn) timeEntry.clockIn = actualUpdates.clockIn
    if (actualUpdates.clockOut !== undefined) timeEntry.clockOut = actualUpdates.clockOut
    if (actualUpdates.status) timeEntry.status = actualUpdates.status
    if (actualUpdates.totalHours !== undefined) timeEntry.totalHours = actualUpdates.totalHours
    if (actualUpdates.justificationNote !== undefined) timeEntry.justificationNote = actualUpdates.justificationNote

    // Recalculate hours if clockOut is set and totalHours not provided
    if (timeEntry.clockOut && actualUpdates.totalHours === undefined) {
      timeEntry.totalHours = timeEntry.calculateTotalHours()
    }

    // Auto-update status based on clockOut
    if (timeEntry.clockOut && timeEntry.status === 'active') {
      timeEntry.status = 'completed'
    } else if (!timeEntry.clockOut && timeEntry.status === 'completed') {
      timeEntry.status = 'active'
    }

    await timeEntry.save()
    await timeEntry.populate('employeeId', 'firstName lastName employeeRole')

    // Convert to plain object for mapper
    const timeEntryObj = timeEntry.toObject()
    const formattedTimeEntry = mapTimeEntryToApi(timeEntryObj)

    return NextResponse.json<ApiResponse<MappedTimeEntry>>({
      success: true,
      data: formattedTimeEntry!,
      message: 'Time entry modifie avec succes',
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API PUT time-entries/[id]:', err)

    if (err.name === 'ValidationError' && err.errors) {
      const validationErrors = Object.values(err.errors).map((e) => e.message)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Donnees invalides',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (err.name === 'CastError' && err.path === '_id') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Format d'ID invalide",
          details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la modification du time entry',
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/time-entries/[id] - Supprimer (desactiver) un time entry
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Non authentifie',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    const userRole = session.user.role
    if (
      !['dev', 'admin'].includes(userRole) &&
      process.env.NODE_ENV !== 'development'
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            'Seuls les developpeurs et administrateurs peuvent supprimer les time entries',
          details: TIME_ENTRY_ERRORS.UNAUTHORIZED,
        },
        { status: 403 }
      )
    }

    await connectToDatabase()

    const timeEntry = await TimeEntry.findOne({
      _id: params.id,
      isActive: true,
    })

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

    // Store info before deletion for renumbering
    const employeeId = timeEntry.employeeId
    const date = timeEntry.date
    const shiftNumber = timeEntry.shiftNumber

    // Hard delete - remove from database permanently
    await timeEntry.deleteOne()

    // Renumber remaining shifts if we deleted shift 1
    if (shiftNumber === 1) {
      // Check if shift 2 exists for same employee and date
      const shift2 = await TimeEntry.findOne({
        employeeId,
        date,
        shiftNumber: 2,
        isActive: true,
      })

      // If shift 2 exists, renumber it to shift 1
      if (shift2) {
        shift2.shiftNumber = 1
        await shift2.save()
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Time entry supprime avec succes',
    })
  } catch (error) {
    const err = error as MongooseError
    console.error('Erreur API DELETE time-entries/[id]:', err)

    if (err.name === 'CastError' && err.path === '_id') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Format d'ID invalide",
          details: TIME_ENTRY_ERRORS.TIME_ENTRY_NOT_FOUND,
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Erreur lors de la suppression du time entry',
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/time-entries/[id] - Gestion CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
