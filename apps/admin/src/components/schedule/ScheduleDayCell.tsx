/**
 * Schedule day cell component
 * Renders shift buttons organized by morning/afternoon for each employee
 * Shows unavailabilities with color-coded badges (CP/AM/Indispo)
 * Empty slots are clickable to create new shifts
 */

import { formatDateToYMD } from "@/lib/schedule/utils";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import type { IUnavailabilityWithEmployee } from "@/types/unavailability";
import { CalendarOff } from "lucide-react";

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
    dayShifts: Shift[],
  ) => EmployeeShiftPosition[];
  isEmployeeUnavailable: (dateStr: string, employeeId: string) => boolean;
  getEmployeeAbsence: (
    dateStr: string,
    employeeId: string,
  ) => IUnavailabilityWithEmployee | undefined;
  onShiftClick: (shift: Shift, e: React.MouseEvent) => void;
  onEmptySlotClick?: (
    date: Date,
    employeeId: string,
    period: "morning" | "afternoon",
  ) => void;
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
      className="flex h-5 w-full items-center justify-center rounded px-1 text-xs font-medium text-white"
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
  onEmptySlotClick?: (
    date: Date,
    employeeId: string,
    period: "morning" | "afternoon",
  ) => void;
}

function TimeSlotColumn({
  shifts,
  employee,
  date,
  period,
  onShiftClick,
  onEmptySlotClick,
}: TimeSlotColumnProps) {
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
  getEmployeeAbsence,
  onShiftClick,
  onEmptySlotClick,
}: ScheduleDayCellProps) {
  const positionedShifts = getShiftsPositionedByEmployee(date, dayShifts);
  const dateStr = formatDateToYMD(date);

  return (
    <div className="flex-1 space-y-1.5">
      {employees.map((employee) => {
        // Ne pas afficher l'employé si la date est après sa démission
        if (employee.endDate) {
          const endDate = new Date(employee.endDate);
          endDate.setHours(0, 0, 0, 0);
          const cellDate = new Date(date);
          cellDate.setHours(0, 0, 0, 0);

          if (cellDate > endDate) {
            return null; // Employé démissionnaire, ne pas afficher
          }
        }

        // Check if employee has an absence on this date
        const absence = getEmployeeAbsence(dateStr, employee.id);

        // If unavailable, show color-coded badge based on absence type
        if (absence) {
          const absenceTypeLabels: Record<string, string> = {
            paid_leave: "CP",
            sick_leave: "AM",
            unavailability: "Indispo",
          };
          const label = absenceTypeLabels[absence.type] || "Absent";
          const bgColor =
            absence.type === "paid_leave"
              ? "bg-green-500 text-white border-green-500"
              : absence.type === "sick_leave"
                ? "bg-red-500 text-white border-red-500"
                : "bg-orange-500 text-white border-orange-500";

          return (
            <div
              key={employee.id}
              className={`flex h-5 items-center justify-center gap-2 rounded border px-1 text-xs font-medium ${bgColor}`}
              title={`${employee.firstName} - ${label}`}
            >
              <CalendarOff className="h-3 w-3" />
              <span>{label}</span>
            </div>
          );
        }

        // Otherwise, show shifts as usual
        const employeeShifts = positionedShifts.find(
          (ps) => ps.employee.id === employee.id,
        );
        const morningShifts = employeeShifts?.morningShifts ?? [];
        const afternoonShifts = employeeShifts?.afternoonShifts ?? [];

        return (
          <div key={employee.id} className="flex h-5 items-center gap-2">
            {/* Morning column (before 14:30) */}
            <div className="flex-1 min-w-0 text-center">
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
            <div className="flex-1 min-w-0 text-center">
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
