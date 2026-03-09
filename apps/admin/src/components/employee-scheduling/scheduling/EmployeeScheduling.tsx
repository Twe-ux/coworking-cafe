"use client";

import { Button } from "@/components/ui/button";
import { CalendarOff } from "lucide-react";
import { useState } from "react";
import { EmptyState, NonStaffFallback } from "./EmptyState";
import type { EmployeeSchedulingProps } from "./types";
import { DEFAULT_EMPLOYEES } from "./types";
import { useScheduleData } from "./useScheduleData";
import { useTimeEntries } from "./useTimeEntries";
import { WeekCard } from "./WeekCard";
import { RequestUnavailabilityModal } from "@/components/staff/RequestUnavailabilityModal";

/**
 * EmployeeScheduling - Staff weekly schedule view
 *
 * Displays:
 * - Time tracking cards for all employees
 * - Weekly schedule with morning/afternoon shift splits
 * - Employee hours summary per week
 *
 * Refactored from 697 lines to ~80 lines using sub-components and hooks
 */
export function EmployeeScheduling({
  className = "",
  employees: propEmployees = DEFAULT_EMPLOYEES,
  shifts: propShifts = [],
  unavailabilities: propUnavailabilities = [],
  onAddShift,
  readOnly = false,
  userRole = "",
}: EmployeeSchedulingProps) {
  const [unavailabilityModalOpen, setUnavailabilityModalOpen] = useState(false);
  const employees = propEmployees;
  const unavailabilities = propUnavailabilities;
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hooks for data management
  const {
    getShiftsPositionedByEmployee,
    getWeeksWithShifts,
    calculateWeeklyHours,
  } = useScheduleData({
    employees,
    shifts: propShifts,
  });

  const { timeEntries, fetchTimeEntries } = useTimeEntries({ currentDate });

  // Staff view (also accessible to admin/dev)
  const hasAccess = ['staff', 'admin', 'dev'].includes(userRole);

  if (hasAccess) {
    const weeksWithShifts = getWeeksWithShifts();

    if (weeksWithShifts.length === 0) {
      return <EmptyState className={className} />;
    }

    return (
      <>
        <div className={`space-y-6 ${className}`}>
          {/* Time Tracking Section */}
          {/* <TimeTrackingSection employees={employees} /> */}

          {/* Header */}
          <div className="flex flex-row justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userRole === 'staff' ? 'Mon Planning' : 'Planning Staff'}
              </h1>
              <p className="mt-1 text-gray-600">
                {userRole === 'staff'
                  ? 'Vos creneaux de travail par semaine'
                  : 'Creneaux de travail de l\'equipe par semaine'}
              </p>
            </div>
            {userRole === 'staff' && (
              <Button
                variant="outline"
                className="gap-2 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                onClick={() => setUnavailabilityModalOpen(true)}
              >
                <CalendarOff className="w-4 h-4" />
                Demander une indispo
              </Button>
            )}
          </div>

          {/* Weeks with Shifts */}
          <div className="space-y-3">
            {weeksWithShifts.map((week, weekIndex) => (
              <WeekCard
                key={weekIndex}
                week={week}
                employees={employees}
                unavailabilities={unavailabilities}
                getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
                calculateWeeklyHours={calculateWeeklyHours}
              />
            ))}
          </div>
        </div>

        <RequestUnavailabilityModal
          isOpen={unavailabilityModalOpen}
          employees={employees}
          onClose={() => setUnavailabilityModalOpen(false)}
        />
      </>
    );
  }

  // Non-staff fallback
  return <NonStaffFallback className={className} />;
}

// Default export for backward compatibility
export default EmployeeScheduling;
