/**
 * Types for Absence/Leave Management
 * Handles employee absences: unavailability, paid leave (CP), sick leave (AM)
 */

export type AbsenceType = 'unavailability' | 'paid_leave' | 'sick_leave';
export type AbsenceStatus = 'pending' | 'approved' | 'rejected';

/**
 * Affected shift during absence period
 */
export interface AffectedShift {
  date: string; // YYYY-MM-DD
  shiftNumber: 1 | 2;
  scheduledHours: number; // Hours that should have been worked
}

// Alias for compatibility
export type IAffectedShift = AffectedShift;

/**
 * Absence/Leave Request
 */
export interface Absence {
  _id: string;
  id: string; // Alias for _id
  employeeId: string;

  // Type
  type: AbsenceType;
  // unavailability = Staff-requested, unpaid, needs replacement
  // paid_leave = Staff-requested, paid, deducted from CP balance
  // sick_leave = Admin-created only, unpaid by employer (sécu sociale), tracked

  // Period
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD

  // Status
  status: AbsenceStatus;

  // Affected shifts (calculated automatically)
  affectedShifts: AffectedShift[];

  // Validation
  approvedBy?: string; // Admin user ID
  approvedAt?: string; // ISO string
  rejectedBy?: string; // Admin user ID
  rejectedAt?: string; // ISO string
  rejectionReason?: string;

  // Details
  reason?: string; // Employee's reason
  adminNotes?: string; // Internal admin notes

  // Hours calculation
  totalHours: number; // Total hours of absence
  paidHours: number; // Hours paid (paid_leave only)

  // Metadata
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Request body for creating absence
 */
export interface CreateAbsenceRequest {
  employeeId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
  reason?: string;
  adminNotes?: string;
}

/**
 * Request body for updating absence status
 */
export interface UpdateAbsenceStatusRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string; // Required if status = 'rejected'
  adminNotes?: string;
}

/**
 * Paid leave (CP) balance for an employee
 */
export interface PaidLeaveBalance {
  employeeId: string;
  totalAcquired: number; // Total CP acquired (2.5 days/month × months worked)
  totalTaken: number; // Total CP taken (approved paid_leave)
  balance: number; // Available CP (acquired - taken)
  balanceInDays: number; // Balance converted to days (balance / hoursPerDay)
}

/**
 * Monthly absence summary for payroll
 */
export interface MonthlyAbsenceSummary {
  employeeId: string;
  paidLeaveHours: number; // Approved paid_leave hours
  sickLeaveHours: number; // Approved sick_leave hours (not paid by employer)
  unavailabilityHours: number; // Approved unavailability hours (not paid)
}
