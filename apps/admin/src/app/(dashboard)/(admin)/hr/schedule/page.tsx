"use client";

import { DayShiftsModal } from "@/components/schedule/DayShiftsModal";
import EmployeeMonthlyCard from "@/components/schedule/EmployeeMonthlyCard";
import { ShiftModal } from "@/components/schedule/ShiftModal";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { useShifts } from "@/hooks/useShifts";
import type { Shift } from "@/types/shift";
import { useCallback, useEffect, useState } from "react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  color: string;
  isActive: boolean;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string; // Format "YYYY-MM-DD"
  clockIn: string; // Format "HH:mm"
  clockOut?: string | null; // Format "HH:mm"
  shiftNumber: 1 | 2;
  totalHours?: number;
  status: "active" | "completed";
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showDayShiftsModal, setShowDayShiftsModal] = useState(false);
  const [dayShiftsDate, setDayShiftsDate] = useState<Date>(new Date());

  // Calculate date range for ALL visible days in calendar (including partial weeks)
  // This ensures we fetch shifts for end of previous month and start of next month
  const getCalendarDateRange = (date: Date) => {
    // Get first day of month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Calculate first Monday visible (may be in previous month)
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Calculate last day visible (6 weeks maximum)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6 * 7 - 1);

    return { startDate, endDate };
  };

  const { startDate: calendarStartDate, endDate: calendarEndDate } =
    getCalendarDateRange(currentDate);

  // Fetch shifts for entire calendar view (including partial weeks)
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
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data || []);
      } else {
        console.error("Error fetching employees:", result.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch time entries for current month
  const fetchTimeEntries = useCallback(async () => {
    try {
      setIsLoadingTimeEntries(true);

      const { startDate, endDate } = getCalendarDateRange(currentDate);
      const params = new URLSearchParams();
      params.append("startDate", startDate.toISOString().split("T")[0]);
      params.append("endDate", endDate.toISOString().split("T")[0]);

      const response = await fetch(`/api/time-entries?${params.toString()}`);
      const result = await response.json();

      console.log('🔍 DEBUG - Fetching time entries with params:', params.toString());
      console.log('🔍 DEBUG - Time entries response:', result);

      if (result.success) {
        console.log('🔍 DEBUG - Setting time entries:', result.data);
        setTimeEntries(result.data || []);
      } else {
        console.error("Error fetching time entries:", result.error);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchTimeEntries();
  }, [currentDate]);

  // Refresh shifts when month changes
  useEffect(() => {
    refreshShifts();
  }, [currentDate, refreshShifts]);

  // Utility: Determine if shift starts before 14:30 (morning)
  const isShiftBeforeCutoff = (startTime: string): boolean => {
    if (!startTime || typeof startTime !== "string") return false;

    const timeParts = startTime.split(":");
    if (timeParts.length !== 2) return false;

    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;

    const startTimeInMinutes = hours * 60 + minutes;
    const cutoffTime = 14 * 60 + 30; // 14h30 in minutes
    return startTimeInMinutes < cutoffTime;
  };

  // Organize shifts by morning/afternoon time slots
  const organizeShiftsByTimeSlots = (shifts: Shift[]) => {
    const morning = shifts.filter((shift) =>
      isShiftBeforeCutoff(shift.startTime)
    );
    const afternoon = shifts.filter(
      (shift) => !isShiftBeforeCutoff(shift.startTime)
    );

    return { morning, afternoon };
  };

  // Get shifts positioned by employee for a given date
  const getShiftsPositionedByEmployee = (date: Date, dayShifts: Shift[]) => {
    return employees.map((employee) => {
      const employeeShifts = dayShifts.filter(
        (shift) => shift.employeeId === employee.id
      );
      const organizedShifts = organizeShiftsByTimeSlots(employeeShifts);

      return {
        employee,
        shifts: employeeShifts,
        morningShifts: organizedShifts.morning,
        afternoonShifts: organizedShifts.afternoon,
      };
    });
  };

  // Convert decimal hours to HH:MM format
  const formatHoursToHHMM = (decimalHours: number): string => {
    if (decimalHours <= 0) return "";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    if (minutes === 60) {
      return `${String(hours + 1).padStart(2, "0")}:00`;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  // Calculate weekly hours for an employee
  const calculateWeeklyHours = (
    employeeId: string,
    weekShifts: Shift[]
  ): number => {
    const employeeShifts = weekShifts.filter(
      (s) => s.employeeId === employeeId
    );

    return employeeShifts.reduce((totalHours, shift) => {
      const start = new Date(`2000-01-01 ${shift.startTime}`);
      let end = new Date(`2000-01-01 ${shift.endTime}`);

      // Handle night shifts that end the next day
      if (end <= start) {
        end.setDate(end.getDate() + 1);
      }

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return totalHours + Math.max(0, hours);
    }, 0);
  };

  const handleCellClick = (date: Date, dayShifts: Shift[]) => {
    // If no shifts, open creation modal directly
    if (dayShifts.length === 0) {
      setSelectedDate(date);
      setSelectedShift(null);
      setModalOpen(true);
    } else {
      // If shifts exist, open day shifts modal
      setDayShiftsDate(date);
      setShowDayShiftsModal(true);
    }
  };

  const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    // Open day shifts modal for that shift's date
    setDayShiftsDate(shift.date);
    setShowDayShiftsModal(true);
  };

  const handleEditShiftFromDay = (shift: Shift) => {
    // Close day shifts modal and open edit modal
    setShowDayShiftsModal(false);
    setSelectedDate(shift.date);
    setSelectedShift(shift);
    setModalOpen(true);
  };

  const handleAddShiftFromDay = () => {
    // Close day shifts modal and open creation modal
    setShowDayShiftsModal(false);
    setSelectedDate(dayShiftsDate);
    setSelectedShift(null);
    setModalOpen(true);
  };

  const handleSaveShift = async (data: any) => {
    const result = await createShift(data);
    if (result.success) {
      refreshShifts();
    }
    return result;
  };

  const handleUpdateShift = async (id: string, data: any) => {
    const result = await updateShift(id, data);
    if (result.success) {
      refreshShifts();
    }
    return result;
  };

  const handleDeleteShift = async (id: string) => {
    const result = await deleteShift(id);
    if (result.success) {
      refreshShifts();
      setModalOpen(false);
      setSelectedShift(null);
    }
    return result;
  };

  const renderCell = (date: Date, dayShifts: Shift[]) => {
    const positionedShifts = getShiftsPositionedByEmployee(date, dayShifts);

    return (
      <div className="flex-1 space-y-1 overflow-hidden">
        {employees.map((employee) => {
          const employeeShifts = positionedShifts.find(
            (ps) => ps.employee.id === employee.id
          );
          const morningShifts = employeeShifts
            ? employeeShifts.morningShifts
            : [];
          const afternoonShifts = employeeShifts
            ? employeeShifts.afternoonShifts
            : [];

          return (
            <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-2">
              {/* Morning column (before 14:30) */}
              <div className="space-y-1 text-center">
                {morningShifts.length > 0 ? (
                  morningShifts.map((shift) => (
                    <button
                      key={shift.id}
                      onClick={(e) => handleShiftClick(shift, e)}
                      className="w-full rounded px-1 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: employee.color || "#9CA3AF" }}
                      title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                    >
                      {shift.startTime}-{shift.endTime}
                    </button>
                  ))
                ) : (
                  <div className="h-5 py-0.5"></div>
                )}
              </div>

              {/* Afternoon column (after 14:30) */}
              <div className="space-y-1 text-center">
                {afternoonShifts.length > 0 ? (
                  afternoonShifts.map((shift) => (
                    <button
                      key={shift.id}
                      onClick={(e) => handleShiftClick(shift, e)}
                      className="w-full rounded px-1 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: employee.color || "#9CA3AF" }}
                      title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                    >
                      {shift.startTime}-{shift.endTime}
                    </button>
                  ))
                ) : (
                  <div className="h-5 py-0.5"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSidebarWeek = (week: any, weekShifts: Shift[]) => {
    return (
      <>
        {/* Spacer pour aligner avec le numéro de jour dans les cellules */}
        <div className="mb-1 h-6"></div>
        {/* Liste des employés avec leurs heures */}
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
  };

  const isLoading = isLoadingShifts || isLoadingEmployees || isLoadingTimeEntries;

  // Helper to normalize date to YYYY-MM-DD string (avoiding timezone issues)
  const formatDateToYMD = (date: Date | string): string => {
    if (typeof date === "string") {
      // Extract YYYY-MM-DD from ISO string or return as-is if already in that format
      return date.split("T")[0];
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const totalHours = shifts.reduce((total, shift) => {
    const start = new Date(`2000-01-01 ${shift.startTime}`);
    let end = new Date(`2000-01-01 ${shift.endTime}`);
    if (end <= start) end.setDate(end.getDate() + 1);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  // Get shifts for the selected day (compare normalized date strings)
  const dayShiftsDateStr = formatDateToYMD(dayShiftsDate);
  const dayShifts = shifts.filter((shift) => {
    const shiftDateStr = formatDateToYMD(shift.date);
    return shiftDateStr === dayShiftsDateStr;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planning</h1>
          <p className="text-gray-600">Gestion des créneaux de travail</p>
        </div>
      </div>

      {/* Calendar */}
      {isLoading ? (
        <div className="flex h-[600px] items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : shiftsError ? (
        <div className="flex h-[600px] items-center justify-center">
          <p className="text-red-500">Erreur: {shiftsError}</p>
        </div>
      ) : (
        <MonthlyCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          data={shifts}
          getDateForData={(shift) => shift.date}
          renderCell={renderCell}
          renderSidebarWeek={renderSidebarWeek}
          onCellClick={handleCellClick}
          showSidebar
          sidebarTitle="Staff"
          sidebarItems={employees.map((emp) => ({
            id: emp.id,
            label: emp.firstName,
            color: emp.color || "#9CA3AF",
          }))}
          cellHeight={120}
        />
      )}

      {/* Day Shifts Modal */}
      <DayShiftsModal
        open={showDayShiftsModal}
        onClose={() => setShowDayShiftsModal(false)}
        date={dayShiftsDate}
        shifts={dayShifts}
        onEditShift={handleEditShiftFromDay}
        onDeleteShift={handleDeleteShift}
        onAddShift={handleAddShiftFromDay}
      />

      {/* Shift Modal */}
      <ShiftModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedShift(null);
        }}
        onSave={handleSaveShift}
        onUpdate={handleUpdateShift}
        onDelete={handleDeleteShift}
        employees={employees}
        selectedDate={selectedDate}
        existingShift={selectedShift}
      />

      {/* Monthly Statistics */}
      {!isLoading && employees.length > 0 && (
        <EmployeeMonthlyCard
          employees={employees}
          shifts={shifts}
          timeEntries={timeEntries}
          currentDate={currentDate}
          className="mt-8"
        />
      )}
    </div>
  );
}
