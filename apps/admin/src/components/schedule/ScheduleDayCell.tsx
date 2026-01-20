/**
 * Schedule day cell component
 * Renders shift buttons organized by morning/afternoon for each employee
 */

import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";

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
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
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
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
}

function TimeSlotColumn({ shifts, employee, onShiftClick }: TimeSlotColumnProps) {
  if (shifts.length === 0) {
    return <div className="h-5 py-0.5"></div>;
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
  onShiftClick,
}: ScheduleDayCellProps) {
  const positionedShifts = getShiftsPositionedByEmployee(date, dayShifts);

  return (
    <div className="flex-1 space-y-1 overflow-hidden">
      {employees.map((employee) => {
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
                onShiftClick={onShiftClick}
              />
            </div>

            {/* Afternoon column (after 14:30) */}
            <div className="space-y-1 text-center">
              <TimeSlotColumn
                shifts={afternoonShifts}
                employee={employee}
                onShiftClick={onShiftClick}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
