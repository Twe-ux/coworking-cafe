"use client";

import { useState, useEffect } from "react";
import EmployeeMonthlyCard from "@/components/shared/EmployeeMonthlyCard";
import { ScheduleDayCell } from "@/components/schedule/ScheduleDayCell";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { ScheduleModals } from "@/components/schedule/ScheduleModals";
import { ScheduleSkeleton } from "@/components/schedule/ScheduleSkeleton";
import { ScheduleWeekSidebar } from "@/components/schedule/ScheduleWeekSidebar";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { Button } from "@/components/ui/button";
import { CalendarOff } from "lucide-react";
import { CreateUnavailabilityModal } from "@/components/hr/unavailability/CreateUnavailabilityModal";
import type { CreateUnavailabilityData } from "@/components/hr/unavailability/CreateUnavailabilityModal";
import { useAdaptiveCellHeight } from "@/hooks/useAdaptiveCellHeight";
import { useSchedulePage } from "@/hooks/useSchedulePage";
import { useUnavailabilities } from "@/hooks/useUnavailabilities";
import type { Shift } from "@/types/shift";
import type { WeekData } from "@/components/shared/calendar/types";

/**
 * Schedule Page - Employee work schedule management
 *
 * Features:
 * - Monthly calendar view with employee shifts
 * - Morning/afternoon shift organization
 * - Weekly hours tracking per employee
 * - Create, edit, and delete shifts
 * - Monthly statistics overview
 */
export default function SchedulePage() {
  const {
    // Data
    currentDate,
    employees,
    shifts,
    timeEntries,
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
    getShiftsPositionedByEmployee,
    calculateProjectedWeeklyHours,
    formatHoursToHHMM,
    isEmployeeUnavailable,
  } = useSchedulePage();

  // Absence modal state
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [absences, setAbsences] = useState<any[]>([]);

  // Unavailabilities hook for creating absences
  const { createUnavailability } = useUnavailabilities();

  // Calculate adaptive cell height based on number of employees
  // MUST be called before any conditional returns (React hooks rules)
  const cellHeight = useAdaptiveCellHeight(employees.length);

  // Fetch approved absences for current month
  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        const response = await fetch(
          `/api/hr/absences?status=approved&startDate=${startDate}&endDate=${endDate}`
        );
        const data = await response.json();

        if (data.success) {
          setAbsences(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching absences:', error);
      }
    };

    fetchAbsences();
  }, [currentDate]);

  // Handler: Create absence
  const handleCreateAbsence = async (data: CreateUnavailabilityData) => {
    await createUnavailability(data);
    setIsAbsenceModalOpen(false);
  };

  // Loading state
  if (isLoading) {
    return <ScheduleSkeleton />;
  }

  // Render cell content for calendar
  const renderCell = (date: Date, cellDayShifts: Shift[]) => (
    <ScheduleDayCell
      date={date}
      dayShifts={cellDayShifts}
      employees={employees}
      getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
      isEmployeeUnavailable={isEmployeeUnavailable}
      onShiftClick={handleShiftClick}
      onEmptySlotClick={handleEmptySlotClick}
    />
  );

  // Render sidebar week content
  const renderSidebarWeek = (week: WeekData, weekShifts: Shift[]) => (
    <ScheduleWeekSidebar
      week={week}
      weekShifts={weekShifts}
      employees={employees}
      formatHoursToHHMM={formatHoursToHHMM}
    />
  );

  return (
    <div className="space-y-6 pb-8">
      <ScheduleHeader />

      {/* Calendar */}
      {shiftsError ? (
        <div className="flex h-[600px] items-center justify-center">
          <p className="text-red-500">Erreur: {shiftsError}</p>
        </div>
      ) : (
        <MonthlyCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          data={shifts}
          getDateForData={(shift) => shift.date}
          secondaryData={timeEntries}
          getDateForSecondaryData={(entry) => entry.date}
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
          cellHeight={cellHeight}
          actionButton={
            <Button
              onClick={() => setIsAbsenceModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
              <CalendarOff className="mr-2 h-4 w-4" />
              Créer une absence
            </Button>
          }
        />
      )}

      {/* Modals */}
      <ScheduleModals
        scheduleModal={scheduleModal}
        dayShiftsModal={dayShiftsModal}
        dayShifts={dayShifts}
        employees={employees}
        onCloseScheduleModal={closeScheduleModal}
        onCloseDayShiftsModal={closeDayShiftsModal}
        onEditShift={handleEditShiftFromDay}
        onAddShift={handleAddShiftFromDay}
        onSaveShift={handleSaveShift}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
      />

      {/* Monthly Statistics */}
      {employees.length > 0 && (
        <EmployeeMonthlyCard
          employees={employees}
          shifts={shifts}
          timeEntries={timeEntries}
          absences={absences}
          currentDate={currentDate}
          className="mt-8"
        />
      )}

      {/* Create Absence Modal */}
      <CreateUnavailabilityModal
        isOpen={isAbsenceModalOpen}
        employees={employees}
        onClose={() => setIsAbsenceModalOpen(false)}
        onCreate={handleCreateAbsence}
      />
    </div>
  );
}
