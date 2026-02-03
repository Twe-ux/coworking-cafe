"use client";

import { useCallback, useEffect, useState } from "react";
import { useShiftsQuery } from "@/hooks/useShiftsQuery";
import { useUnavailabilities } from "@/hooks/useUnavailabilities";
import type { Employee } from "@/types/hr";
import type { TimeEntry, ApiResponse } from "@/types/timeEntry";
import type { IUnavailabilityWithEmployee } from "@/types/unavailability";
import { getCalendarDateRange } from "@/lib/schedule/utils";

interface UseScheduleDataReturn {
  // Data
  currentDate: Date;
  employees: Employee[];
  shifts: ReturnType<typeof useShiftsQuery>["shifts"];
  timeEntries: TimeEntry[];
  unavailabilities: IUnavailabilityWithEmployee[];

  // Loading states
  isLoading: boolean; // Initial load (no cached data)
  isRefetching: boolean; // Background refetch (has cached data)
  shiftsError: string | null;

  // Actions
  setCurrentDate: (date: Date) => void;
  refreshShifts: () => void;

  // Shift operations
  createShift: ReturnType<typeof useShiftsQuery>["createShift"];
  updateShift: ReturnType<typeof useShiftsQuery>["updateShift"];
  deleteShift: ReturnType<typeof useShiftsQuery>["deleteShift"];
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

  // Fetch shifts using React Query (with automatic caching)
  const {
    shifts,
    isLoading: isLoadingShifts,
    error: shiftsError,
    createShift,
    updateShift,
    deleteShift,
    refreshShifts,
  } = useShiftsQuery({
    startDate: calendarStartDate.toISOString().split("T")[0],
    endDate: calendarEndDate.toISOString().split("T")[0],
    active: true,
  });

  // Fetch unavailabilities (approved only) for current month
  const { unavailabilities } = useUnavailabilities({
    startDate: calendarStartDate.toISOString().split("T")[0],
    endDate: calendarEndDate.toISOString().split("T")[0],
    status: "approved",
  });

  // Fetch active employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result: ApiResponse<Employee[]> = await response.json();

      if (result.success && result.data) {
        // Filtrer pour masquer l'employé dev
        const filteredEmployees = result.data.filter((emp) => {
          return !emp.email.toLowerCase().includes("dev@") &&
                 emp.email !== "dev@coworkingcafe.com";
        });
        setEmployees(filteredEmployees);
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

  // ✅ SUPPRIMÉ : useEffect redondant qui causait une double récupération des shifts
  // useShifts gère déjà le fetch automatiquement quand les options changent

  // Critical loading state: only show skeleton if shifts or employees are loading
  // AND we don't have any cached data yet (initial load)
  const isInitialLoading =
    (isLoadingShifts && shifts.length === 0) ||
    (isLoadingEmployees && employees.length === 0);

  // Background loading: data is being refetched but we have cached data
  const isRefetching = isLoadingShifts || isLoadingEmployees || isLoadingTimeEntries;

  return {
    currentDate,
    employees,
    shifts,
    timeEntries,
    unavailabilities,
    isLoading: isInitialLoading,
    isRefetching,
    shiftsError,
    setCurrentDate,
    refreshShifts,
    createShift,
    updateShift,
    deleteShift,
  };
}
