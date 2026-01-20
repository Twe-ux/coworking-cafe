/**
 * Schedule utility functions
 * Pure functions for date calculations and shift organization
 */

import type { Shift } from "@/types/shift";
import type { Employee } from "@/types/hr";

// ==================== TYPES ====================

export interface CalendarDateRange {
  startDate: Date;
  endDate: Date;
}

export interface EmployeeShiftPosition {
  employee: Employee;
  shifts: Shift[];
  morningShifts: Shift[];
  afternoonShifts: Shift[];
}

// ==================== DATE UTILITIES ====================

/**
 * Calculate date range for ALL visible days in calendar (including partial weeks)
 * Ensures we fetch shifts for end of previous month and start of next month
 */
export function getCalendarDateRange(date: Date): CalendarDateRange {
  // Get first day of month
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Calculate first Monday visible (may be in previous month)
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  // Calculate last day visible (6 weeks maximum)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6 * 7 - 1);

  return { startDate, endDate };
}

/**
 * Normalize date to YYYY-MM-DD string (avoiding timezone issues)
 */
export function formatDateToYMD(date: Date | string): string {
  if (typeof date === "string") {
    // Extract YYYY-MM-DD from ISO string or return as-is if already in that format
    return date.split("T")[0];
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ==================== SHIFT UTILITIES ====================

/** Cutoff time for morning/afternoon split: 14:30 */
const CUTOFF_MINUTES = 14 * 60 + 30;

/**
 * Determine if shift starts before 14:30 (morning)
 */
export function isShiftBeforeCutoff(startTime: string): boolean {
  if (!startTime || typeof startTime !== "string") return false;

  const timeParts = startTime.split(":");
  if (timeParts.length !== 2) return false;

  const [hours, minutes] = timeParts.map(Number);
  if (isNaN(hours) || isNaN(minutes)) return false;

  const startTimeInMinutes = hours * 60 + minutes;
  return startTimeInMinutes < CUTOFF_MINUTES;
}

/**
 * Organize shifts by morning/afternoon time slots
 */
export function organizeShiftsByTimeSlots(shifts: Shift[]): {
  morning: Shift[];
  afternoon: Shift[];
} {
  const morning = shifts.filter((shift) => isShiftBeforeCutoff(shift.startTime));
  const afternoon = shifts.filter((shift) => !isShiftBeforeCutoff(shift.startTime));

  return { morning, afternoon };
}

/**
 * Get shifts positioned by employee for a given date
 */
export function getShiftsPositionedByEmployee(
  employees: Employee[],
  dayShifts: Shift[]
): EmployeeShiftPosition[] {
  return employees.map((employee) => {
    const employeeShifts = dayShifts.filter(
      (shift) => shift.employeeId === employee.id
    );
    const organizedShifts = organizeShiftsByTimeSlots(employeeShifts);

    return {
      employee,
      shifts: employeeShifts,
      morningShifts: organizedShifts.morning,
      afternoonShifts: organizedShifts.afternoon,
    };
  });
}

// ==================== HOURS UTILITIES ====================

/**
 * Convert decimal hours to HH:MM format
 */
export function formatHoursToHHMM(decimalHours: number): string {
  if (decimalHours <= 0) return "";

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  if (minutes === 60) {
    return `${String(hours + 1).padStart(2, "0")}:00`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Calculate duration in hours between start and end time
 */
export function calculateShiftDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  // Handle night shifts that end the next day
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, hours);
}

/**
 * Calculate weekly hours for an employee from shifts
 */
export function calculateWeeklyHours(
  employeeId: string,
  weekShifts: Shift[]
): number {
  const employeeShifts = weekShifts.filter((s) => s.employeeId === employeeId);

  return employeeShifts.reduce((totalHours, shift) => {
    return totalHours + calculateShiftDuration(shift.startTime, shift.endTime);
  }, 0);
}
