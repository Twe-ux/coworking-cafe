import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import Absence from '@/models/absence';
import Employee from '@/models/employee';
import type { CreateAbsenceRequest } from '@/types/absence';

/**
 * GET /api/hr/absences
 * Get list of absences with optional filters
 * Query params:
 *  - employeeId: Filter by employee
 *  - status: Filter by status (pending, approved, rejected)
 *  - type: Filter by type (unavailability, paid_leave, sick_leave)
 *  - startDate: Filter absences starting after this date (YYYY-MM-DD)
 *  - endDate: Filter absences ending before this date (YYYY-MM-DD)
 *  - limit: Max results (default: 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  // Allow public access ONLY for approved absences (for staff planning view)
  // All other requests require authentication
  if (status !== 'approved') {
    const authResult = await requireAuth(['dev', 'admin', 'staff']);
    if (!authResult.authorized) return authResult.response;
  }

  try {
    await connectMongoose();

    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: Record<string, unknown> = { isActive: true };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (startDate) {
      query.startDate = { $gte: startDate };
    }

    if (endDate) {
      query.endDate = { $lte: endDate };
    }

    // Fetch absences
    const absences = await Absence.find(query)
      .populate('employeeId', 'firstName lastName email')
      .sort({ startDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse(absences, 200);
  } catch (error) {
    console.error('Error fetching absences:', error);
    return errorResponse('Failed to fetch absences', 500);
  }
}

/**
 * POST /api/hr/absences
 * Create a new absence request
 * Body: CreateAbsenceRequest
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(['dev', 'admin', 'staff']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const body: CreateAbsenceRequest = await request.json();
    console.log('[POST Absence] Request:', { type: body.type, employeeId: body.employeeId, dates: { start: body.startDate, end: body.endDate } });

    // Validation
    if (!body.employeeId || !body.type || !body.startDate || !body.endDate) {
      return errorResponse('Missing required fields', 400);
    }

    // Validate dates
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse('Invalid date format', 400);
    }

    if (end < start) {
      return errorResponse('End date must be after start date', 400);
    }

    // Check if employee exists
    const employee = await Employee.findById(body.employeeId);
    if (!employee) {
      return errorResponse('Employee not found', 404);
    }

    console.log('[POST Absence] Employee found:', employee.id);

    // Get all business days in the absence period (Monday-Saturday, exclude Sunday)
    const businessDays: string[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const isSunday = dayOfWeek === 0;
      const dateStr = currentDate.toISOString().split('T')[0];

      if (!isSunday) {
        businessDays.push(dateStr);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    let affectedShifts: Array<{ date: string; shiftNumber: 1; scheduledHours: number }>;

    console.log('[POST Absence] Calculating hours for type:', body.type);

    // Calculate hours based on absence type
    if (body.type === 'paid_leave') {
      // CP: Use French legal formula (independent of planning)
      console.log('[POST Absence] CP - Using legal formula');
      const totalHours = (businessDays.length / 6) * employee.contractualHours;
      const hoursPerDay = businessDays.length > 0 ? totalHours / businessDays.length : 0;

      affectedShifts = businessDays.map(dateStr => ({
        date: dateStr,
        shiftNumber: 1 as const,
        scheduledHours: hoursPerDay,
      }));

      console.log('[POST Absence] CP totalHours:', totalHours);
    } else if (body.type === 'sick_leave') {
      // AM: Calculate based on planned shifts
      console.log('[POST Absence] AM - Fetching planned shifts');
      const { default: Shift } = await import('@/models/shift');

      const plannedShifts = await Shift.find({
        employeeId: body.employeeId,
        date: { $in: businessDays },
        isActive: true,
      }).lean();

      console.log('[POST Absence] AM - Found', plannedShifts.length, 'shifts');

      affectedShifts = businessDays.map(dateStr => {
        // Find shift(s) for this date
        const dayShifts = plannedShifts.filter(shift => {
          const shiftDateStr = typeof shift.date === 'string'
            ? shift.date
            : shift.date.toISOString().split('T')[0];
          return shiftDateStr === dateStr;
        });

        // Calculate total hours for this day
        let dayHours = 0;
        if (dayShifts.length > 0) {
          dayShifts.forEach(shift => {
            const start = new Date(`2000-01-01 ${shift.startTime}`);
            let end = new Date(`2000-01-01 ${shift.endTime}`);

            // Handle overnight shifts
            if (end <= start) {
              end.setDate(end.getDate() + 1);
            }

            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            dayHours += Math.max(0, hours);
          });
        }

        return {
          date: dateStr,
          shiftNumber: 1 as const,
          scheduledHours: dayHours,
        };
      });

      const totalAM = affectedShifts.reduce((sum, s) => sum + s.scheduledHours, 0);
      console.log('[POST Absence] AM totalHours:', totalAM);
    } else {
      // Unavailability: 0 hours
      console.log('[POST Absence] Indispo - 0 hours');
      affectedShifts = businessDays.map(dateStr => ({
        date: dateStr,
        shiftNumber: 1 as const,
        scheduledHours: 0,
      }));
    }

    console.log('[POST Absence] affectedShifts count:', affectedShifts.length);

    // Create absence
    // Use status from body if provided (admin can create pre-approved), otherwise default to 'pending'
    // Note: totalHours will be calculated automatically by the pre-save hook from affectedShifts
    console.log('[POST Absence] Creating absence...');
    const absence = new Absence({
      employeeId: body.employeeId,
      type: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
      adminNotes: body.adminNotes,
      status: body.status || 'pending',
      affectedShifts,
      paidHours: 0,
      isActive: true,
    });

    console.log('[POST Absence] Saving absence...');
    await absence.save();
    console.log('[POST Absence] Absence saved, totalHours:', absence.totalHours);

    return successResponse(absence, 201);
  } catch (error) {
    console.error('Error creating absence:', error);
    return errorResponse('Failed to create absence', 500);
  }
}
