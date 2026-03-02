/**
 * Schedule week sidebar component
 * Displays employee weekly hours in the calendar sidebar
 */

import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import type { TimeEntry } from "@/types/timeEntry";
import type { WeekData } from "@/components/shared/calendar/types";

interface ScheduleWeekSidebarProps {
  week: WeekData;
  weekShifts: Shift[];
  weekTimeEntries?: TimeEntry[];
  employees: Employee[];
  formatHoursToHHMM: (decimalHours: number) => string;
}

export function ScheduleWeekSidebar({
  week,
  employees,
  weekShifts,
  formatHoursToHHMM,
}: ScheduleWeekSidebarProps) {
  // Calculate shift duration
  const calculateShiftDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    // Handle night shifts that end the next day
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours);
  };

  // Filter employees: don't show if entire week is after their end date
  const activeEmployees = employees.filter((employee) => {
    if (!employee.endDate) return true; // No end date, always active

    const endDate = new Date(employee.endDate);
    endDate.setHours(0, 0, 0, 0);
    const weekStart = new Date(week.weekStart);
    weekStart.setHours(0, 0, 0, 0);

    // Only show if week starts before or on end date
    return weekStart <= endDate;
  });

  return (
    <>
      {/* Spacer to align with day number in cells */}
      <div className="mb-1 h-5"></div>

      {/* Employee list with their weekly hours */}
      <div className="flex-1 space-y-1">
        {activeEmployees.map((employee) => {
          // Calculate planned hours (all shifts of the week)
          const plannedHours = weekShifts
            .filter((shift) => shift.employeeId === employee.id)
            .reduce((total, shift) => {
              return total + calculateShiftDuration(shift.startTime, shift.endTime);
            }, 0);

          const plannedText = formatHoursToHHMM(plannedHours);

          return (
            <div
              key={employee.id}
              className="flex h-5 items-center justify-between rounded px-1 text-xs font-medium text-white"
              style={{ backgroundColor: employee.color || "#9CA3AF" }}
              title={`${employee.fullName}: ${plannedText}`}
            >
              <span className="flex-1 truncate text-[10px]">
                {employee.firstName}
              </span>
              <span className="ml-1 text-xs opacity-90">{plannedText}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
