/**
 * Schedule day cell component
 * Renders shift buttons organized by morning/afternoon for each employee
 * Shows unavailabilities with employee color when employee is unavailable
 * Empty slots are clickable to create new shifts
 */

import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import { formatDateToYMD } from "@/lib/schedule/utils";

interface EmployeeShiftPosition {
  employee: Employee;
  shifts: Shift[];
  morningShifts: Shift[];
  afternoonShifts: Shift[];
}

interface ScheduleDayCellProps {
  date: Date;
  dayShifts: Shift[];
  employees: Employee[];
  getShiftsPositionedByEmployee: (
    date: Date,
    dayShifts: Shift[]
  ) => EmployeeShiftPosition[];
  isEmployeeUnavailable: (dateStr: string, employeeId: string) => boolean;
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
  onEmptySlotClick?: (date: Date, employeeId: string, period: "morning" | "afternoon") => void;
}

interface ShiftButtonProps {
  shift: Shift;
  employee: Employee;
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
}

function ShiftButton({ shift, employee, onShiftClick }: ShiftButtonProps) {
  return (
    <button
      onClick={(e) => onShiftClick(shift, e)}
      className="w-full rounded px-1 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: employee.color || "#9CA3AF" }}
      title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
    >
      {shift.startTime}-{shift.endTime}
    </button>
  );
}

interface TimeSlotColumnProps {
  shifts: Shift[];
  employee: Employee;
  date: Date;
  period: "morning" | "afternoon";
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
  onEmptySlotClick?: (date: Date, employeeId: string, period: "morning" | "afternoon") => void;
}

function TimeSlotColumn({ shifts, employee, date, period, onShiftClick, onEmptySlotClick }: TimeSlotColumnProps) {
  if (shifts.length === 0) {
    return (
      <button
        className="h-5 w-full rounded py-0.5 transition-colors hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          onEmptySlotClick?.(date, employee.id, period);
        }}
        title={`Ajouter un créneau ${period === "morning" ? "matin" : "après-midi"} pour ${employee.firstName}`}
      />
    );
  }

  return (
    <>
      {shifts.map((shift) => (
        <ShiftButton
          key={shift.id}
          shift={shift}
          employee={employee}
          onShiftClick={onShiftClick}
        />
      ))}
    </>
  );
}

export function ScheduleDayCell({
  date,
  dayShifts,
  employees,
  getShiftsPositionedByEmployee,
  isEmployeeUnavailable,
  onShiftClick,
  onEmptySlotClick,
}: ScheduleDayCellProps) {
  const positionedShifts = getShiftsPositionedByEmployee(date, dayShifts);
  const dateStr = formatDateToYMD(date);

  return (
    <div className="flex-1 space-y-1 overflow-hidden">
      {employees.map((employee) => {
        // Check if employee is unavailable on this date
        const isUnavailable = isEmployeeUnavailable(dateStr, employee.id);

        // If unavailable, show "INDISPO" badge with employee color
        if (isUnavailable) {
          return (
            <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-2">
              <div
                className="col-span-2 rounded px-1 py-0.5 text-center text-xs font-bold text-white"
                style={{ backgroundColor: employee.color || "#9CA3AF" }}
                title={`${employee.firstName} est indisponible ce jour`}
              >
                INDISPO
              </div>
            </div>
          );
        }

        // Otherwise, show shifts as usual
        const employeeShifts = positionedShifts.find(
          (ps) => ps.employee.id === employee.id
        );
        const morningShifts = employeeShifts?.morningShifts ?? [];
        const afternoonShifts = employeeShifts?.afternoonShifts ?? [];

        return (
          <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-2">
            {/* Morning column (before 14:30) */}
            <div className="space-y-1 text-center">
              <TimeSlotColumn
                shifts={morningShifts}
                employee={employee}
                date={date}
                period="morning"
                onShiftClick={onShiftClick}
                onEmptySlotClick={onEmptySlotClick}
              />
            </div>

            {/* Afternoon column (after 14:30) */}
            <div className="space-y-1 text-center">
              <TimeSlotColumn
                shifts={afternoonShifts}
                employee={employee}
                date={date}
                period="afternoon"
                onShiftClick={onShiftClick}
                onEmptySlotClick={onEmptySlotClick}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
