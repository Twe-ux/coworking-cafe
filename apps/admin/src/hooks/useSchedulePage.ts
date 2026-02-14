"use client";

import { useCallback, useMemo } from "react";
import { useScheduleData } from "@/hooks/useScheduleData";
import { useScheduleModals } from "@/hooks/useScheduleModals";
import type { Shift } from "@/types/shift";
import type { Employee } from "@/types/hr";
import type { IUnavailabilityWithEmployee } from "@/types/unavailability";
import {
  formatDateToYMD,
  formatHoursToHHMM,
  calculateWeeklyHours,
  calculateProjectedWeeklyHours,
  getShiftsPositionedByEmployee,
  type EmployeeShiftPosition,
} from "@/lib/schedule/utils";
import { isDateInRange } from "@/lib/utils/format-date";

// Re-export types for convenience
export type { EmployeeShiftPosition } from "@/lib/schedule/utils";

export interface UseSchedulePageReturn {
  // Data
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
  timeEntries: ReturnType<typeof useScheduleData>["timeEntries"];
  unavailabilities: IUnavailabilityWithEmployee[];
  dayShifts: Shift[];

  // Loading states
  isLoading: boolean;
  shiftsError: string | null;

  // Modal states
  scheduleModal: ReturnType<typeof useScheduleModals>["scheduleModal"];
  dayShiftsModal: ReturnType<typeof useScheduleModals>["dayShiftsModal"];

  // Actions
  setCurrentDate: (date: Date) => void;
  handleCellClick: ReturnType<typeof useScheduleModals>["handleCellClick"];
  handleEmptySlotClick: ReturnType<typeof useScheduleModals>["handleEmptySlotClick"];
  handleShiftClick: ReturnType<typeof useScheduleModals>["handleShiftClick"];
  handleEditShiftFromDay: ReturnType<typeof useScheduleModals>["handleEditShiftFromDay"];
  handleAddShiftFromDay: ReturnType<typeof useScheduleModals>["handleAddShiftFromDay"];
  handleSaveShift: ReturnType<typeof useScheduleModals>["handleSaveShift"];
  handleUpdateShift: ReturnType<typeof useScheduleModals>["handleUpdateShift"];
  handleDeleteShift: ReturnType<typeof useScheduleModals>["handleDeleteShift"];
  closeScheduleModal: ReturnType<typeof useScheduleModals>["closeScheduleModal"];
  closeDayShiftsModal: ReturnType<typeof useScheduleModals>["closeDayShiftsModal"];

  // Utilities
  getShiftsPositionedByEmployee: (date: Date, dayShifts: Shift[]) => EmployeeShiftPosition[];
  calculateWeeklyHours: (employeeId: string, weekShifts: Shift[]) => number;
  calculateProjectedWeeklyHours: typeof calculateProjectedWeeklyHours;
  formatHoursToHHMM: (decimalHours: number) => string;
  formatDateToYMD: (date: Date | string) => string;
  isEmployeeUnavailable: (dateStr: string, employeeId: string) => boolean;
}

/**
 * Main hook for the Schedule Page
 * Combines data fetching, modal management, and utility functions
 */
export function useSchedulePage(): UseSchedulePageReturn {
  // Data management
  const {
    currentDate,
    employees,
    shifts,
    timeEntries,
    unavailabilities,
    isLoading,
    shiftsError,
    setCurrentDate,
    refreshShifts,
    createShift,
    updateShift,
    deleteShift,
  } = useScheduleData();

  // Modal management
  const {
    scheduleModal,
    dayShiftsModal,
    handleCellClick,
    handleEmptySlotClick,
    handleShiftClick,
    handleEditShiftFromDay,
    handleAddShiftFromDay,
    handleSaveShift,
    handleUpdateShift,
    handleDeleteShift,
    closeScheduleModal,
    closeDayShiftsModal,
  } = useScheduleModals({
    createShift,
    updateShift,
    deleteShift,
    refreshShifts,
  });

  // Memoized utility functions that depend on employees
  const getShiftsPositionedByEmployeeMemo = useCallback(
    (date: Date, dayShifts: Shift[]): EmployeeShiftPosition[] => {
      return getShiftsPositionedByEmployee(employees, dayShifts);
    },
    [employees]
  );

  // Get day shifts for modal based on selected date
  const dayShifts = useMemo(() => {
    const dayShiftsDateStr = formatDateToYMD(dayShiftsModal.date);
    return shifts.filter((shift) => {
      const shiftDateStr = formatDateToYMD(shift.date);
      return shiftDateStr === dayShiftsDateStr;
    });
  }, [shifts, dayShiftsModal.date]);

  // Check if employee is unavailable on a specific date
  const isEmployeeUnavailable = useCallback(
    (dateStr: string, employeeId: string): boolean => {
      return unavailabilities.some((unavail) => {
        return (
          unavail.employeeId === employeeId &&
          isDateInRange(dateStr, unavail.startDate, unavail.endDate)
        );
      });
    },
    [unavailabilities]
  );

  return {
    // Data
    currentDate,
    employees,
    shifts,
    timeEntries,
    unavailabilities,
    dayShifts,

    // Loading states
    isLoading,
    shiftsError,

    // Modal states
    scheduleModal,
    dayShiftsModal,

    // Actions
    setCurrentDate,
    handleCellClick,
    handleEmptySlotClick,
    handleShiftClick,
    handleEditShiftFromDay,
    handleAddShiftFromDay,
    handleSaveShift,
    handleUpdateShift,
    handleDeleteShift,
    closeScheduleModal,
    closeDayShiftsModal,

    // Utilities
    getShiftsPositionedByEmployee: getShiftsPositionedByEmployeeMemo,
    calculateWeeklyHours,
    calculateProjectedWeeklyHours,
    formatHoursToHHMM,
    formatDateToYMD,
    isEmployeeUnavailable,
  };
}
