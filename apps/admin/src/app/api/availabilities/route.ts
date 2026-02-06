import { NextRequest, NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'
import { Availability } from '@/models/availability'
import Employee from '@/models/employee'
import { getDayOfWeekLabel } from '@/types/availability'
import { requireAuth } from '@/lib/api/auth'
import mongoose from 'mongoose'

// Types for MongoDB populated documents
interface PopulatedEmployee {
  _id: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  fullName: string
  employeeRole: string
  color?: string
}

interface AvailabilityFilter {
  employeeId?: string
  dayOfWeek?: number
  isActive?: boolean
}

interface AvailabilityLean {
  _id: mongoose.Types.ObjectId
  employeeId: PopulatedEmployee | mongoose.Types.ObjectId
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

/**
 * GET /api/availabilities - Retrieve list of availabilities with optional filters
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(['dev', 'admin', 'staff'])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const { searchParams } = new URL(request.url)

    // Filter parameters
    const employeeId = searchParams.get('employeeId')
    const dayOfWeek = searchParams.get('dayOfWeek')
    const active = searchParams.get('active')

    // Build filter query
    const filter: AvailabilityFilter = {}

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
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .sort({ employeeId: 1, dayOfWeek: 1, startTime: 1 })
      .lean() as AvailabilityLean[]

    // Transform data for frontend
    const transformedAvailabilities = availabilities.map((availability) => {
      // Type guard to ensure employeeId is populated
      const employee = availability.employeeId as PopulatedEmployee

      return {
        id: availability._id.toString(),
        employeeId: employee._id.toString(),
        employee: {
          id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          fullName: employee.fullName,
          role: employee.employeeRole,
          color: employee.color,
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
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedAvailabilities,
      count: transformedAvailabilities.length,
    })
  } catch (error: unknown) {
    console.error('Error GET availabilities:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while fetching availabilities',
        details: errorMessage,
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
    const authResult = await requireAuth(['dev', 'admin'])
    if (!authResult.authorized) {
      return authResult.response
    }

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
    const existingEmployee = await Employee.findById(employeeId)
    if (!existingEmployee) {
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
      .populate('employeeId', 'firstName lastName fullName employeeRole color')
      .lean() as AvailabilityLean | null

    if (!populatedAvailability) {
      return NextResponse.json(
        { success: false, error: 'Error retrieving created availability' },
        { status: 500 }
      )
    }

    // Type guard to ensure employeeId is populated
    const employee = populatedAvailability.employeeId as PopulatedEmployee

    const transformedAvailability = {
      id: populatedAvailability._id.toString(),
      employeeId: employee._id.toString(),
      employee: {
        id: employee._id.toString(),
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: employee.fullName,
        role: employee.employeeRole,
        color: employee.color,
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

    return NextResponse.json(
      {
        success: true,
        data: transformedAvailability,
        message: 'Availability created successfully',
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error POST availabilities:', error)

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as mongoose.Error.ValidationError
      const validationErrors: Record<string, string> = {}

      for (const field in mongooseError.errors) {
        validationErrors[field] = mongooseError.errors[field].message
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

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        success: false,
        error: 'Server error while creating availability',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
