import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Shift from '@/models/shift'
import Employee from '@/models/employee'
import { requireAuth } from '@/lib/api/auth'
import { mapShiftToApi } from '@/lib/mappers'

/**
 * Normalize date to YYYY-MM-DD string format
 * Handles both Date objects and string inputs
 */
function normalizeDateToString(date: Date | string): string {
  if (typeof date === 'string') {
    // Extract YYYY-MM-DD from ISO string or return as-is
    return date.split('T')[0]
  }
  // Convert Date object to YYYY-MM-DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Shift update data interface */
interface ShiftUpdateData {
  employeeId?: string
  date?: string // ⚠️ CHANGED: Was Date, now string YYYY-MM-DD
  startTime?: string
  endTime?: string
  type?: string
  location?: string
  notes?: string
  isActive?: boolean
}

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/shifts/[id] - Retrieve a specific shift
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

    const shift = await Shift.findById(params.id)
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean()

    if (!shift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      )
    }

    const transformedShift = mapShiftToApi(shift)

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

    const body = (await request.json()) as {
      employeeId?: string
      date?: string
      startTime?: string
      endTime?: string
      type?: string
      location?: string
      notes?: string
      isActive?: boolean
    }

    await connectMongoose()

    const existingShift = await Shift.findById(params.id)
    if (!existingShift) {
      return NextResponse.json(
        { success: false, error: 'Shift not found' },
        { status: 404 }
      )
    }

    // If employee changes, verify new employee exists
    if (body.employeeId && body.employeeId !== existingShift.employeeId.toString()) {
      const employee = await Employee.findById(body.employeeId)
      if (!employee) {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        )
      }
    }

    // Build update data
    const updateData: ShiftUpdateData = {}
    if (body.employeeId !== undefined) updateData.employeeId = body.employeeId
    // ⚠️ IMPORTANT: Normalize date to string YYYY-MM-DD format
    if (body.date !== undefined) updateData.date = normalizeDateToString(body.date)
    if (body.startTime !== undefined) updateData.startTime = body.startTime
    if (body.endTime !== undefined) updateData.endTime = body.endTime
    if (body.type !== undefined) updateData.type = body.type
    if (body.location !== undefined) updateData.location = body.location?.trim() || undefined
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || undefined
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Check for conflicts if timing data changes
    if (body.employeeId || body.date || body.startTime || body.endTime) {
      const checkEmployeeId = body.employeeId || existingShift.employeeId
      // Normalize date for comparison
      const checkDate = body.date ? normalizeDateToString(body.date) : existingShift.date
      const checkStartTime = body.startTime || existingShift.startTime
      const checkEndTime = body.endTime || existingShift.endTime

      const conflictingShift = await Shift.findOne({
        _id: { $ne: params.id },
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

    const updatedShift = await Shift.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean()

    const transformedShift = mapShiftToApi(updatedShift)

    return NextResponse.json({
      success: true,
      data: transformedShift,
      message: 'Shift updated successfully',
    })
  } catch (error) {
    const err = error as Error & { name?: string; errors?: Record<string, { message: string }> }
    console.error('Error PUT shift:', err)

    if (err.name === 'ValidationError' && err.errors) {
      const validationErrors: Record<string, string> = {}
      for (const field in err.errors) {
        validationErrors[field] = err.errors[field].message
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
