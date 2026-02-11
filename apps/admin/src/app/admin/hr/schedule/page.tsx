"use client";

import EmployeeMonthlyCard from "@/components/shared/EmployeeMonthlyCard";
import { ScheduleDayCell } from "@/components/schedule/ScheduleDayCell";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { ScheduleModals } from "@/components/schedule/ScheduleModals";
import { ScheduleSkeleton } from "@/components/schedule/ScheduleSkeleton";
import { ScheduleWeekSidebar } from "@/components/schedule/ScheduleWeekSidebar";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { useSchedulePage } from "@/hooks/useSchedulePage";
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
    calculateWeeklyHours,
    formatHoursToHHMM,
    isEmployeeUnavailable,
  } = useSchedulePage();

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
      calculateWeeklyHours={calculateWeeklyHours}
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
          currentDate={currentDate}
          className="mt-8"
        />
      )}
    </div>
  );
}
