import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import Absence from '@/models/absence';
import Employee from '@/models/employee';
import type { UpdateAbsenceStatusRequest } from '@/types/absence';
import {
  sendUnavailabilityApprovedEmail,
  sendUnavailabilityRejectedEmail,
} from '@/lib/email/emailService';

/**
 * GET /api/hr/absences/[id]
 * Get absence details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin', 'staff']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const absence = await Absence.findById(params.id)
      .populate('employeeId', 'firstName lastName email contractualHours')
      .lean();

    if (!absence) {
      return errorResponse('Absence not found', 404);
    }

    return successResponse(absence, 200);
  } catch (error) {
    console.error('Error fetching absence:', error);
    return errorResponse('Failed to fetch absence', 500);
  }
}

/**
 * PATCH /api/hr/absences/[id]
 * Update absence (dates, type, reason, or status)
 * Only admin/dev can modify
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const body: any = await request.json();

    // Find absence
    const absence = await Absence.findById(params.id);
    if (!absence) {
      return errorResponse('Absence not found', 404);
    }

    // Update fields if provided
    if (body.startDate) absence.startDate = body.startDate;
    if (body.endDate) absence.endDate = body.endDate;
    if (body.type) absence.type = body.type;
    if (body.reason !== undefined) absence.reason = body.reason;
    if (body.adminNotes !== undefined) absence.adminNotes = body.adminNotes;

    // Handle status update (approve/reject)
    if (body.status) {
      if (!['approved', 'rejected'].includes(body.status)) {
        return errorResponse('Invalid status', 400);
      }

      if (body.status === 'rejected' && !body.rejectionReason) {
        return errorResponse('Rejection reason is required', 400);
      }

      absence.status = body.status;

      if (body.status === 'approved') {
        absence.approvedBy = authResult.userId as unknown as typeof absence.approvedBy;
        absence.approvedAt = new Date();

        // If approved paid_leave, deduct from employee's CP balance
        if (absence.type === 'paid_leave') {
          const employee = await Employee.findById(absence.employeeId);
          if (employee) {
            employee.paidLeaveTaken += absence.totalHours;
            employee.paidLeaveBalance = employee.paidLeaveAcquired - employee.paidLeaveTaken;
            await employee.save();
          }
        }
      } else {
        absence.rejectedBy = authResult.userId as unknown as typeof absence.rejectedBy;
        absence.rejectedAt = new Date();
        absence.rejectionReason = body.rejectionReason;
      }

      // Send email notification after status update
      const employee = await Employee.findById(absence.employeeId);
      if (employee && employee.email) {
        // Map absence type to email template type
        const emailType = absence.type === 'paid_leave'
          ? 'vacation'
          : absence.type === 'sick_leave'
          ? 'sick'
          : 'personal';

        if (body.status === 'approved') {
          await sendUnavailabilityApprovedEmail(employee.email, {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: emailType as 'vacation' | 'sick' | 'personal' | 'other',
            startDate: absence.startDate,
            endDate: absence.endDate,
            reason: absence.reason,
          });
        } else if (body.status === 'rejected' && body.rejectionReason) {
          await sendUnavailabilityRejectedEmail(employee.email, {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: emailType as 'vacation' | 'sick' | 'personal' | 'other',
            startDate: absence.startDate,
            endDate: absence.endDate,
            reason: absence.reason,
            rejectionReason: body.rejectionReason,
          });
        }
      }
    }

    // Check if we need to recalculate hours
    // Triggers: dates changed OR affectedShifts have invalid hours (from old data)
    const needsRecalculation =
      body.startDate ||
      body.endDate ||
      absence.affectedShifts.length === 0 ||
      absence.affectedShifts.every(shift => shift.scheduledHours === 0);

    if (needsRecalculation) {
      const start = new Date(absence.startDate);
      const end = new Date(absence.endDate);

      const employee = await Employee.findById(absence.employeeId);
      if (!employee) {
        return errorResponse('Employee not found', 404);
      }

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

      // Calculate hours based on absence type
      if (absence.type === 'paid_leave') {
        // CP: Use French legal formula (independent of planning)
        const totalHours = (businessDays.length / 6) * employee.contractualHours;
        const hoursPerDay = businessDays.length > 0 ? totalHours / businessDays.length : 0;

        affectedShifts = businessDays.map(dateStr => ({
          date: dateStr,
          shiftNumber: 1 as const,
          scheduledHours: hoursPerDay,
        }));
      } else if (absence.type === 'sick_leave') {
        // AM: Calculate based on planned shifts
        const { default: Shift } = await import('@/models/shift');

        const plannedShifts = await Shift.find({
          employeeId: absence.employeeId,
          date: { $in: businessDays },
          isActive: true,
        }).lean();

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
      } else {
        // Unavailability: 0 hours
        affectedShifts = businessDays.map(dateStr => ({
          date: dateStr,
          shiftNumber: 1 as const,
          scheduledHours: 0,
        }));
      }

      absence.affectedShifts = affectedShifts;
    }

    await absence.save();

    return successResponse(absence, 200);
  } catch (error) {
    console.error('Error updating absence:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update absence';
    return errorResponse(errorMessage, 500);
  }
}

/**
 * DELETE /api/hr/absences/[id]
 * Soft delete absence (set isActive = false)
 * Admin/dev can delete any absence
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  try {
    await connectMongoose();

    const absence = await Absence.findById(params.id);
    if (!absence) {
      return errorResponse('Absence not found', 404);
    }

    // If absence was approved and type is paid_leave, restore CP balance
    if (absence.status === 'approved' && absence.type === 'paid_leave') {
      const employee = await Employee.findById(absence.employeeId);
      if (employee && absence.totalHours) {
        // Ensure fields exist and are numbers
        const currentTaken = employee.paidLeaveTaken || 0;
        const currentAcquired = employee.paidLeaveAcquired || 0;

        employee.paidLeaveTaken = Math.max(0, currentTaken - absence.totalHours);
        employee.paidLeaveBalance = currentAcquired - employee.paidLeaveTaken;
        await employee.save();
      }
    }

    // Soft delete
    absence.isActive = false;
    await absence.save();

    return successResponse({ message: 'Absence deleted successfully' }, 200);
  } catch (error) {
    console.error('Error deleting absence:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete absence';
    return errorResponse(errorMessage, 500);
  }
}
