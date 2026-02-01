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
  onAddShift,
  readOnly = false,
  userRole = "",
}: EmployeeSchedulingProps) {
  const [unavailabilityModalOpen, setUnavailabilityModalOpen] = useState(false);
  const employees = propEmployees;
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

  // Staff-only view
  if (userRole === "staff") {
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
              <h1 className="text-2xl font-bold text-gray-900">Mon Planning</h1>
              <p className="mt-1 text-gray-600">
                Vos creneaux de travail par semaine
              </p>
            </div>
            <Button
              variant="destructive"
              className="gap-2 border-red-600 border text-red-500 bg-red-50 hover:bg-red-600/20 hover:text-red-700"
              onClick={() => setUnavailabilityModalOpen(true)}
            >
              <CalendarOff className="w-4 h-4" />
              Demander une indispo
            </Button>
          </div>

          {/* Weeks with Shifts */}
          <div className="space-y-3">
            {weeksWithShifts.map((week, weekIndex) => (
              <WeekCard
                key={weekIndex}
                week={week}
                employees={employees}
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
