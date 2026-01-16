import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { Availability } from '@/models/availability'
import Employee from '@/models/employee'
import { getDayOfWeekLabel } from '@/types/availability'

// TODO: Implement auth with getServerSession and authOptions

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/availabilities/[id] - Retrieve a specific availability
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectMongoose()

    const availability = await Availability.findById(params.id)
      .populate('employeeId', 'firstName lastName fullName role color')
      .lean()

    if (!availability) {
      return NextResponse.json(
        { success: false, error: 'Availability not found' },
        { status: 404 }
      )
    }

    const transformedAvailability = {
      id: (availability as any)._id.toString(),
      employeeId: (availability as any).employeeId._id.toString(),
      employee: {
        id: (availability as any).employeeId._id.toString(),
        firstName: (availability as any).employeeId.firstName,
        lastName: (availability as any).employeeId.lastName,
        fullName: (availability as any).employeeId.fullName,
        role: (availability as any).employeeId.role,
        color: (availability as any).employeeId.color,
      },
      dayOfWeek: (availability as any).dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel((availability as any).dayOfWeek),
      startTime: (availability as any).startTime,
      endTime: (availability as any).endTime,
      timeRange: `${(availability as any).startTime} - ${(availability as any).endTime}`,
      isRecurring: (availability as any).isRecurring,
      effectiveFrom: (availability as any).effectiveFrom,
      effectiveUntil: (availability as any).effectiveUntil,
      notes: (availability as any).notes,
      isActive: (availability as any).isActive,
      createdAt: (availability as any).createdAt,
      updatedAt: (availability as any).updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedAvailability,
    })
  } catch (error) {
    console.error('Error GET availability:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching availability',
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
    const updateData: any = {}
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
      .populate('employeeId', 'firstName lastName fullName role color')
      .lean()

    const transformedAvailability = {
      id: (updatedAvailability as any)?._id.toString(),
      employeeId: (updatedAvailability as any)?.employeeId._id.toString(),
      employee: {
        id: (updatedAvailability as any)?.employeeId._id.toString(),
        firstName: (updatedAvailability as any)?.employeeId.firstName,
        lastName: (updatedAvailability as any)?.employeeId.lastName,
        fullName: (updatedAvailability as any)?.employeeId.fullName,
        role: (updatedAvailability as any)?.employeeId.role,
        color: (updatedAvailability as any)?.employeeId.color,
      },
      dayOfWeek: (updatedAvailability as any)?.dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel((updatedAvailability as any)?.dayOfWeek),
      startTime: (updatedAvailability as any)?.startTime,
      endTime: (updatedAvailability as any)?.endTime,
      timeRange: `${(updatedAvailability as any)?.startTime} - ${(updatedAvailability as any)?.endTime}`,
      isRecurring: (updatedAvailability as any)?.isRecurring,
      effectiveFrom: (updatedAvailability as any)?.effectiveFrom,
      effectiveUntil: (updatedAvailability as any)?.effectiveUntil,
      notes: (updatedAvailability as any)?.notes,
      isActive: (updatedAvailability as any)?.isActive,
      createdAt: (updatedAvailability as any)?.createdAt,
      updatedAt: (updatedAvailability as any)?.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedAvailability,
      message: 'Availability updated successfully',
    })
  } catch (error: any) {
    console.error('Error PUT availability:', error)

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {}
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message
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

    return NextResponse.json(
      {
        success: false,
        error: 'Server error while updating availability',
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
  } catch (error) {
    console.error('Error DELETE availability:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while deleting availability',
      },
      { status: 500 }
    )
  }
}
