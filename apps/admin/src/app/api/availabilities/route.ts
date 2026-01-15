import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import Availability from '@/models/availability'
import Employee from '@/models/employee'
import { getDayOfWeekLabel } from '@/types/availability'

// TODO: Implement auth with getServerSession and authOptions

/**
 * GET /api/availabilities - Retrieve list of availabilities with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoose()

    const { searchParams } = new URL(request.url)

    // Filter parameters
    const employeeId = searchParams.get('employeeId')
    const dayOfWeek = searchParams.get('dayOfWeek')
    const active = searchParams.get('active')

    // Build filter query
    const filter: any = {}

    if (employeeId) {
      filter.employeeId = employeeId
    }

    if (dayOfWeek !== null) {
      filter.dayOfWeek = parseInt(dayOfWeek)
    }

    if (active !== null && active !== undefined) {
      filter.isActive = active === 'true'
    }

    // Fetch availabilities with employee information
    const availabilities = await Availability.find(filter)
      .populate('employeeId', 'firstName lastName fullName role color')
      .sort({ employeeId: 1, dayOfWeek: 1, startTime: 1 })
      .lean()

    // Transform data for frontend
    const transformedAvailabilities = availabilities.map((availability) => ({
      id: (availability._id as any).toString(),
      employeeId: (availability.employeeId as any)._id.toString(),
      employee: {
        id: (availability.employeeId as any)._id.toString(),
        firstName: (availability.employeeId as any).firstName,
        lastName: (availability.employeeId as any).lastName,
        fullName: (availability.employeeId as any).fullName,
        role: (availability.employeeId as any).role,
        color: (availability.employeeId as any).color,
      },
      dayOfWeek: availability.dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel(availability.dayOfWeek),
      startTime: availability.startTime,
      endTime: availability.endTime,
      timeRange: `${availability.startTime} - ${availability.endTime}`,
      isRecurring: availability.isRecurring,
      effectiveFrom: availability.effectiveFrom,
      effectiveUntil: availability.effectiveUntil,
      notes: availability.notes,
      isActive: availability.isActive,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: transformedAvailabilities,
      count: transformedAvailabilities.length,
    })
  } catch (error) {
    console.error('Error GET availabilities:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching availabilities',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/availabilities - Create a new availability
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      employeeId,
      dayOfWeek,
      startTime,
      endTime,
      isRecurring = true,
      effectiveFrom,
      effectiveUntil,
      notes,
    } = body

    // Validate required fields
    if (employeeId === undefined || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: {
            employeeId: employeeId === undefined ? 'Employee ID is required' : undefined,
            dayOfWeek: dayOfWeek === undefined ? 'Day of week is required' : undefined,
            startTime: !startTime ? 'Start time is required' : undefined,
            endTime: !endTime ? 'End time is required' : undefined,
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

    // Check for overlapping availabilities
    const overlappingAvailability = await Availability.findOne({
      employeeId,
      dayOfWeek,
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

    if (overlappingAvailability) {
      return NextResponse.json(
        {
          success: false,
          error: 'Overlapping availability detected',
          details: {
            conflict: `An availability already exists from ${overlappingAvailability.startTime} to ${overlappingAvailability.endTime}`,
          },
        },
        { status: 409 }
      )
    }

    // Create new availability
    const newAvailability = new Availability({
      employeeId,
      dayOfWeek,
      startTime,
      endTime,
      isRecurring,
      effectiveFrom: effectiveFrom || undefined,
      effectiveUntil: effectiveUntil || undefined,
      notes: notes?.trim() || undefined,
    })

    await newAvailability.save()

    // Fetch created availability with employee info
    const populatedAvailability = await Availability.findById(newAvailability._id)
      .populate('employeeId', 'firstName lastName fullName role color')
      .lean()

    if (!populatedAvailability) {
      return NextResponse.json(
        { success: false, error: 'Error retrieving created availability' },
        { status: 500 }
      )
    }

    const transformedAvailability = {
      id: ((populatedAvailability as any)._id as any).toString(),
      employeeId: (populatedAvailability as any).employeeId._id.toString(),
      employee: {
        id: (populatedAvailability as any).employeeId._id.toString(),
        firstName: (populatedAvailability as any).employeeId.firstName,
        lastName: (populatedAvailability as any).employeeId.lastName,
        fullName: (populatedAvailability as any).employeeId.fullName,
        role: (populatedAvailability as any).employeeId.role,
        color: (populatedAvailability as any).employeeId.color,
      },
      dayOfWeek: (populatedAvailability as any).dayOfWeek,
      dayOfWeekLabel: getDayOfWeekLabel((populatedAvailability as any).dayOfWeek),
      startTime: (populatedAvailability as any).startTime,
      endTime: (populatedAvailability as any).endTime,
      timeRange: `${(populatedAvailability as any).startTime} - ${(populatedAvailability as any).endTime}`,
      isRecurring: (populatedAvailability as any).isRecurring,
      effectiveFrom: (populatedAvailability as any).effectiveFrom,
      effectiveUntil: (populatedAvailability as any).effectiveUntil,
      notes: (populatedAvailability as any).notes,
      isActive: (populatedAvailability as any).isActive,
      createdAt: (populatedAvailability as any).createdAt,
      updatedAt: (populatedAvailability as any).updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedAvailability,
        message: 'Availability created successfully',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error POST availabilities:', error)

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
        error: 'Server error while creating availability',
      },
      { status: 500 }
    )
  }
}
