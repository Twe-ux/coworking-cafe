import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Shift from '@/models/shift'
import Employee from '@/models/employee'
import { requireAuth } from '@/lib/api/auth'

/**
 * GET /api/shifts - Retrieve list of shifts with optional filters
 * Public endpoint - accessible without authentication for staff pages
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // No auth required for reading shifts (staff schedule page is public)
    await connectMongoose()

    const { searchParams } = new URL(request.url)

    // Filter parameters
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    // Build filter query
    const filter: any = {}

    if (employeeId) {
      filter.employeeId = employeeId
    }

    if (startDate || endDate) {
      filter.date = {}
      if (startDate) {
        filter.date.$gte = startDate // Direct string comparison
      }
      if (endDate) {
        filter.date.$lte = endDate // Direct string comparison
      }
    }

    if (type) {
      filter.type = type
    }

    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true'
    }

    console.log('🔵 [API /api/shifts] Query filter:', JSON.stringify(filter))

    // Fetch shifts with employee information
    const shifts = await Shift.find(filter)
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .sort({ date: 1, startTime: 1 })
      .lean()

    console.log('🟢 [API /api/shifts] MongoDB returned:', shifts.length, 'shifts')

    // Debug: log first few dates to check format
    if (shifts.length > 0) {
      console.log('📅 [API /api/shifts] Sample dates:',
        shifts.slice(0, 3).map(s => ({ date: s.date, type: typeof s.date }))
      )
    }

    // Transform data for frontend
    const transformedShifts = shifts.map((shift) => ({
      id: (shift._id as any).toString(),
      employeeId: (shift.employeeId as any)._id.toString(),
      employee: {
        id: (shift.employeeId as any)._id.toString(),
        firstName: (shift.employeeId as any).firstName,
        lastName: (shift.employeeId as any).lastName,
        fullName: (shift.employeeId as any).fullName,
        role: (shift.employeeId as any).role,
        color: (shift.employeeId as any).color,
      },
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      type: shift.type,
      location: shift.location,
      notes: shift.notes,
      isActive: shift.isActive,
      timeRange: `${shift.startTime} - ${shift.endTime}`,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: transformedShifts,
      count: transformedShifts.length,
    })
  } catch (error) {
    console.error('Error GET shifts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching shifts',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/shifts - Create a new shift
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

    const body = await request.json()
    const { employeeId, date, startTime, endTime, type, location, notes } = body

    // Validate required fields
    if (!employeeId || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: {
            employeeId: !employeeId ? 'Employee ID is required' : undefined,
            date: !date ? 'Date is required' : undefined,
            startTime: !startTime ? 'Start time is required' : undefined,
            endTime: !endTime ? 'End time is required' : undefined,
            type: !type ? 'Shift type is required' : undefined,
          },
        },
        { status: 400 }
      )
    }

    await connectMongoose()

    // Verify employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Date should already be YYYY-MM-DD string from front-end
    // The Mongoose schema validates this format

    // Check for conflicting shifts
    const conflictingShift = await Shift.findOne({
      employeeId,
      date, // Direct string comparison (YYYY-MM-DD)
      isActive: true,
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } },
          ],
        },
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gte: endTime } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } },
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

    // Create new shift
    const newShift = new Shift({
      employeeId,
      date, // Already string YYYY-MM-DD from front-end
      startTime,
      endTime,
      type,
      location: location?.trim() || undefined,
      notes: notes?.trim() || undefined,
    })

    await newShift.save()

    // Fetch created shift with employee info
    const populatedShift = await Shift.findById(newShift._id)
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean()

    if (!populatedShift) {
      return NextResponse.json(
        { success: false, error: 'Error retrieving created shift' },
        { status: 500 }
      )
    }

    const transformedShift = {
      id: ((populatedShift as any)._id as any).toString(),
      employeeId: (populatedShift as any).employeeId._id.toString(),
      employee: {
        id: (populatedShift as any).employeeId._id.toString(),
        firstName: (populatedShift as any).employeeId.firstName,
        lastName: (populatedShift as any).employeeId.lastName,
        fullName: (populatedShift as any).employeeId.fullName,
        role: (populatedShift as any).employeeId.role,
        color: (populatedShift as any).employeeId.color,
      },
      date: (populatedShift as any).date,
      startTime: (populatedShift as any).startTime,
      endTime: (populatedShift as any).endTime,
      type: (populatedShift as any).type,
      location: (populatedShift as any).location,
      notes: (populatedShift as any).notes,
      isActive: (populatedShift as any).isActive,
      timeRange: `${(populatedShift as any).startTime} - ${(populatedShift as any).endTime}`,
      createdAt: (populatedShift as any).createdAt,
      updatedAt: (populatedShift as any).updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedShift,
        message: 'Shift created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error POST shifts:', error)

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

    // Handle duplicate errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'A shift already exists for this employee at this date and time',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Server error while creating shift',
      },
      { status: 500 }
    )
  }
}
