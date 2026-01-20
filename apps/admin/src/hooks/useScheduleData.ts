"use client";

import { useCallback, useEffect, useState } from "react";
import { useShifts } from "@/hooks/useShifts";
import type { Employee } from "@/types/hr";
import type { TimeEntry, ApiResponse } from "@/types/timeEntry";
import { getCalendarDateRange } from "@/lib/schedule/utils";

interface UseScheduleDataReturn {
  // Data
  currentDate: Date;
  employees: Employee[];
  shifts: ReturnType<typeof useShifts>["shifts"];
  timeEntries: TimeEntry[];

  // Loading states
  isLoading: boolean;
  shiftsError: string | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  refreshShifts: () => void;

  // Shift operations
  createShift: ReturnType<typeof useShifts>["createShift"];
  updateShift: ReturnType<typeof useShifts>["updateShift"];
  deleteShift: ReturnType<typeof useShifts>["deleteShift"];
}

/**
 * Hook for fetching and managing schedule data
 * Handles employees, shifts, and time entries
 */
export function useScheduleData(): UseScheduleDataReturn {
  // Core state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Loading states
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(true);

  // Calculate calendar date range
  const { startDate: calendarStartDate, endDate: calendarEndDate } =
    getCalendarDateRange(currentDate);

  // Fetch shifts using the existing hook
  const {
    shifts,
    isLoading: isLoadingShifts,
    error: shiftsError,
    createShift,
    updateShift,
    deleteShift,
    refreshShifts,
  } = useShifts({
    startDate: calendarStartDate.toISOString().split("T")[0],
    endDate: calendarEndDate.toISOString().split("T")[0],
    active: true,
  });

  // Fetch active employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result: ApiResponse<Employee[]> = await response.json();

      if (result.success && result.data) {
        setEmployees(result.data);
      } else {
        console.error("Error fetching employees:", result.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  // Fetch time entries for current month
  const fetchTimeEntries = useCallback(async () => {
    try {
      setIsLoadingTimeEntries(true);

      const { startDate, endDate } = getCalendarDateRange(currentDate);
      const params = new URLSearchParams();
      params.append("startDate", startDate.toISOString().split("T")[0]);
      params.append("endDate", endDate.toISOString().split("T")[0]);

      const response = await fetch(`/api/time-entries?${params.toString()}`);
      const result: ApiResponse<TimeEntry[]> = await response.json();

      if (result.success && result.data) {
        setTimeEntries(result.data);
      } else {
        console.error("Error fetching time entries:", result.error);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  }, [currentDate]);

  // Effects
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  useEffect(() => {
    refreshShifts();
  }, [currentDate, refreshShifts]);

  // Combined loading state
  const isLoading = isLoadingShifts || isLoadingEmployees || isLoadingTimeEntries;

  return {
    currentDate,
    employees,
    shifts,
    timeEntries,
    isLoading,
    shiftsError,
    setCurrentDate,
    refreshShifts,
    createShift,
    updateShift,
    deleteShift,
  };
}
