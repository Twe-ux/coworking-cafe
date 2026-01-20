/**
 * Schedule week sidebar component
 * Displays employee weekly hours in the calendar sidebar
 */

import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import type { WeekData } from "@/components/shared/calendar/types";

interface ScheduleWeekSidebarProps {
  week: WeekData;
  weekShifts: Shift[];
  employees: Employee[];
  calculateWeeklyHours: (employeeId: string, weekShifts: Shift[]) => number;
  formatHoursToHHMM: (decimalHours: number) => string;
}

export function ScheduleWeekSidebar({
  employees,
  weekShifts,
  calculateWeeklyHours,
  formatHoursToHHMM,
}: ScheduleWeekSidebarProps) {
  return (
    <>
      {/* Spacer to align with day number in cells */}
      <div className="mb-1 h-6"></div>

      {/* Employee list with their weekly hours */}
      <div className="flex-1 space-y-1 overflow-hidden">
        {employees.map((employee) => {
          const weeklyHours = calculateWeeklyHours(employee.id, weekShifts);
          const hoursText = formatHoursToHHMM(weeklyHours);

          return (
            <div
              key={employee.id}
              className="flex h-5 items-center justify-between rounded px-1 text-xs font-medium text-white"
              style={{ backgroundColor: employee.color || "#9CA3AF" }}
              title={`${employee.fullName}: ${hoursText}`}
            >
              <span className="flex-1 truncate text-[10px]">
                {employee.firstName}
              </span>
              <span className="ml-1 text-xs opacity-90">{hoursText}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
