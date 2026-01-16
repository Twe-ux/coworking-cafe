import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Shift from '@/models/shift'
import Employee from '@/models/employee'
import { requireAuth } from '@/lib/api/auth'

/**
 * Utility function to create a UTC date from YYYY-MM-DD string
 * Creates date at midnight UTC
 */
function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/shifts/[id] - Retrieve a specific shift
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'manager'])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const shift = await Shift.findById(params.id)
      .populate('employeeId', 'firstName lastName fullName role color')
      .lean()

    if (!shift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      )
    }

    const transformedShift = {
      id: (shift as any)._id.toString(),
      employeeId: (shift as any).employeeId._id.toString(),
      employee: {
        id: (shift as any).employeeId._id.toString(),
        firstName: (shift as any).employeeId.firstName,
        lastName: (shift as any).employeeId.lastName,
        fullName: (shift as any).employeeId.fullName,
        role: (shift as any).employeeId.role,
        color: (shift as any).employeeId.color,
      },
      date: (shift as any).date,
      startTime: (shift as any).startTime,
      endTime: (shift as any).endTime,
      type: (shift as any).type,
      location: (shift as any).location,
      notes: (shift as any).notes,
      isActive: (shift as any).isActive,
      timeRange: `${(shift as any).startTime} - ${(shift as any).endTime}`,
      createdAt: (shift as any).createdAt,
      updatedAt: (shift as any).updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedShift,
    })
  } catch (error) {
    console.error('Error GET shift:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching shift',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/shifts/[id] - Update a shift
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

    const body = await request.json()
    const {
      employeeId,
      date,
      startTime,
      endTime,
      type,
      location,
      notes,
      isActive,
    } = body

    await connectMongoose()

    // Verify shift exists
    const existingShift = await Shift.findById(params.id)
    if (!existingShift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      )
    }

    // If employee changes, verify new employee exists
    if (employeeId && employeeId !== existingShift.employeeId.toString()) {
      const employee = await Employee.findById(employeeId)
      if (!employee) {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (employeeId !== undefined) updateData.employeeId = employeeId
    if (date !== undefined) updateData.date = createLocalDate(date)
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (type !== undefined) updateData.type = type
    if (location !== undefined)
      updateData.location = location?.trim() || undefined
    if (notes !== undefined) updateData.notes = notes?.trim() || undefined
    if (isActive !== undefined) updateData.isActive = isActive

    // Check for conflicts if timing data changes
    if (employeeId || date || startTime || endTime) {
      const checkEmployeeId = employeeId || existingShift.employeeId
      const checkDate = date ? createLocalDate(date) : existingShift.date
      const checkStartTime = startTime || existingShift.startTime
      const checkEndTime = endTime || existingShift.endTime

      const conflictingShift = await Shift.findOne({
        _id: { $ne: params.id }, // Exclude current shift
        employeeId: checkEmployeeId,
        date: checkDate,
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

      if (conflictingShift) {
        return NextResponse.json(
          {
            success: false,
            error: 'Shift conflict detected',
            details: {
              conflict: `A shift already exists from ${conflictingShift.startTime} to ${conflictingShift.endTime}`,
            },
          },
          { status: 409 }
        )
      }
    }

    // Update shift
    const updatedShift = await Shift.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('employeeId', 'firstName lastName fullName role color')
      .lean()

    const transformedShift = {
      id: (updatedShift as any)?._id.toString(),
      employeeId: (updatedShift as any)?.employeeId._id.toString(),
      employee: {
        id: (updatedShift as any)?.employeeId._id.toString(),
        firstName: (updatedShift as any)?.employeeId.firstName,
        lastName: (updatedShift as any)?.employeeId.lastName,
        fullName: (updatedShift as any)?.employeeId.fullName,
        role: (updatedShift as any)?.employeeId.role,
        color: (updatedShift as any)?.employeeId.color,
      },
      date: (updatedShift as any)?.date,
      startTime: (updatedShift as any)?.startTime,
      endTime: (updatedShift as any)?.endTime,
      type: (updatedShift as any)?.type,
      location: (updatedShift as any)?.location,
      notes: (updatedShift as any)?.notes,
      isActive: (updatedShift as any)?.isActive,
      timeRange: `${(updatedShift as any)?.startTime} - ${(updatedShift as any)?.endTime}`,
      createdAt: (updatedShift as any)?.createdAt,
      updatedAt: (updatedShift as any)?.updatedAt,
    }

    return NextResponse.json({
      success: true,
      data: transformedShift,
      message: 'Shift updated successfully',
    })
  } catch (error: any) {
    console.error('Error PUT shift:', error)

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
        error: 'Server error while updating shift',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/shifts/[id] - Delete a shift (hard delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    // Verify shift exists
    const existingShift = await Shift.findById(params.id)
    if (!existingShift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      )
    }

    // Hard delete from database
    await Shift.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Shift deleted successfully',
    })
  } catch (error) {
    console.error('Error DELETE shift:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while deleting shift',
      },
      { status: 500 }
    )
  }
}
