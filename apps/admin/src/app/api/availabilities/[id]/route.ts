import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { Availability } from '@/models/availability'
import Employee from '@/models/employee'
import { getDayOfWeekLabel } from '@/types/availability'
import { requireAuth } from '@/lib/api/auth'
import type { ObjectId } from 'mongoose'

interface RouteParams {
  params: {
    id: string
  }
}

// Interface pour l'employé populé
interface PopulatedEmployee {
  _id: ObjectId
  firstName: string
  lastName: string
  fullName: string
  role: string
  color: string
}

// Interface pour l'availability avec employé populé
interface PopulatedAvailability {
  _id: ObjectId
  employeeId: PopulatedEmployee
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
  effectiveFrom?: Date
  effectiveUntil?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Interface pour les données de mise à jour
interface UpdateData {
  dayOfWeek?: number
  startTime?: string
  endTime?: string
  isRecurring?: boolean
  effectiveFrom?: Date | undefined
  effectiveUntil?: Date | undefined
  notes?: string | undefined
  isActive?: boolean
}

/**
 * GET /api/availabilities/[id] - Retrieve a specific availability
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'staff'])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const availability = await Availability.findById(params.id)
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean()

    if (!availability) {
      return NextResponse.json(
        { success: false, error: 'Availability not found' },
        { status: 404 }
      )
    }

    const populatedAvailability = availability as unknown as PopulatedAvailability

    const transformedAvailability = {
      id: populatedAvailability._id.toString(),
      employeeId: populatedAvailability.employeeId._id.toString(),
      employee: {
        id: populatedAvailability.employeeId._id.toString(),
        firstName: populatedAvailability.employeeId.firstName,
        lastName: populatedAvailability.employeeId.lastName,
        fullName: populatedAvailability.employeeId.fullName,
        role: populatedAvailability.employeeId.role,
        color: populatedAvailability.employeeId.color,
      },
      dayOfWeek: populatedAvailability.dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel(populatedAvailability.dayOfWeek),
      startTime: populatedAvailability.startTime,
      endTime: populatedAvailability.endTime,
      timeRange: `${populatedAvailability.startTime} - ${populatedAvailability.endTime}`,
      isRecurring: populatedAvailability.isRecurring,
      effectiveFrom: populatedAvailability.effectiveFrom,
      effectiveUntil: populatedAvailability.effectiveUntil,
      notes: populatedAvailability.notes,
      isActive: populatedAvailability.isActive,
      createdAt: populatedAvailability.createdAt,
      updatedAt: populatedAvailability.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedAvailability,
    })
  } catch (error: unknown) {
    console.error('Error GET availability:', error)

    // Handle MongoDB CastError (format d'ID invalide)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID invalide",
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server error while fetching availability',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching availability',
        details: 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/availabilities/[id] - Update an availability
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

    const body = await request.json()
    const {
      dayOfWeek,
      startTime,
      endTime,
      isRecurring,
      effectiveFrom,
      effectiveUntil,
      notes,
      isActive,
    } = body

    await connectMongoose()

    // Verify availability exists
    const existingAvailability = await Availability.findById(params.id)
    if (!existingAvailability) {
      return NextResponse.json(
        { success: false, error: 'Availability not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: UpdateData = {}
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring
    if (effectiveFrom !== undefined) updateData.effectiveFrom = effectiveFrom || undefined
    if (effectiveUntil !== undefined) updateData.effectiveUntil = effectiveUntil || undefined
    if (notes !== undefined) updateData.notes = notes?.trim() || undefined
    if (isActive !== undefined) updateData.isActive = isActive

    // Check for conflicts if timing data changes
    if (dayOfWeek !== undefined || startTime || endTime) {
      const checkDayOfWeek = dayOfWeek !== undefined ? dayOfWeek : existingAvailability.dayOfWeek
      const checkStartTime = startTime || existingAvailability.startTime
      const checkEndTime = endTime || existingAvailability.endTime

      const conflictingAvailability = await Availability.findOne({
        _id: { $ne: params.id },
        employeeId: existingAvailability.employeeId,
        dayOfWeek: checkDayOfWeek,
        isActive: true,
        $or: [
          {
            $and: [
              { startTime: { $lte: checkStartTime } },
              { endTime: { $gt: checkStartTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lt: checkEndTime } },
              { endTime: { $gte: checkEndTime } },
            ],
          },
          {
            $and: [
              { startTime: { $gte: checkStartTime } },
              { endTime: { $lte: checkEndTime } },
            ],
          },
        ],
      })

      if (conflictingAvailability) {
        return NextResponse.json(
          {
            success: false,
            error: 'Availability conflict detected',
            details: {
              conflict: `An availability already exists from ${conflictingAvailability.startTime} to ${conflictingAvailability.endTime}`,
            },
          },
          { status: 409 }
        )
      }
    }

    // Update availability
    const updatedAvailability = await Availability.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean()

    const populatedUpdatedAvailability = updatedAvailability as unknown as PopulatedAvailability

    const transformedAvailability = {
      id: populatedUpdatedAvailability._id.toString(),
      employeeId: populatedUpdatedAvailability.employeeId._id.toString(),
      employee: {
        id: populatedUpdatedAvailability.employeeId._id.toString(),
        firstName: populatedUpdatedAvailability.employeeId.firstName,
        lastName: populatedUpdatedAvailability.employeeId.lastName,
        fullName: populatedUpdatedAvailability.employeeId.fullName,
        role: populatedUpdatedAvailability.employeeId.role,
        color: populatedUpdatedAvailability.employeeId.color,
      },
      dayOfWeek: populatedUpdatedAvailability.dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel(populatedUpdatedAvailability.dayOfWeek),
      startTime: populatedUpdatedAvailability.startTime,
      endTime: populatedUpdatedAvailability.endTime,
      timeRange: `${populatedUpdatedAvailability.startTime} - ${populatedUpdatedAvailability.endTime}`,
      isRecurring: populatedUpdatedAvailability.isRecurring,
      effectiveFrom: populatedUpdatedAvailability.effectiveFrom,
      effectiveUntil: populatedUpdatedAvailability.effectiveUntil,
      notes: populatedUpdatedAvailability.notes,
      isActive: populatedUpdatedAvailability.isActive,
      createdAt: populatedUpdatedAvailability.createdAt,
      updatedAt: populatedUpdatedAvailability.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedAvailability,
      message: 'Availability updated successfully',
    })
  } catch (error: unknown) {
    console.error('Error PUT availability:', error)

    // Handle MongoDB CastError (format d'ID invalide)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID invalide",
        },
        { status: 400 }
      )
    }

    // Handle Mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {}
      const errorObj = error as unknown as { errors: Record<string, { message: string }> }
      for (const field in errorObj.errors) {
        validationErrors[field] = errorObj.errors[field].message
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Validation errors',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Handle generic errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server error while updating availability',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Server error while updating availability',
        details: 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/availabilities/[id] - Delete an availability (hard delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    // Verify availability exists
    const existingAvailability = await Availability.findById(params.id)
    if (!existingAvailability) {
      return NextResponse.json(
        { success: false, error: 'Availability not found' },
        { status: 404 }
      )
    }

    // Hard delete from database
    await Availability.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Availability deleted successfully',
    })
  } catch (error: unknown) {
    console.error('Error DELETE availability:', error)

    // Handle MongoDB CastError (format d'ID invalide)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID invalide",
        },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server error while deleting availability',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Server error while deleting availability',
        details: 'Unknown error',
      },
      { status: 500 }
    )
  }
}
