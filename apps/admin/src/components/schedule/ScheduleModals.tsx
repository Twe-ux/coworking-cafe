/**
 * Schedule modals wrapper component
 * Combines DayShiftsModal and ShiftModal for schedule management
 */

import { DayShiftsModal } from "@/components/schedule/DayShiftsModal";
import { ShiftModal } from "@/components/schedule/ShiftModal";
import type { Employee } from "@/types/hr";
import type { Shift, CreateShiftInput } from "@/types/shift";

/** Result type for shift operations matching modal interfaces */
interface ShiftOperationResult {
  success: boolean;
  error?: string;
}

interface ScheduleModalState {
  isOpen: boolean;
  selectedDate: string; // YYYY-MM-DD format (always string, never Date)
  selectedShift: Shift | null;
  defaultEmployeeId?: string;
  defaultShiftType?: "morning" | "afternoon";
}

interface DayShiftsModalState {
  isOpen: boolean;
  date: string; // YYYY-MM-DD format (always string, never Date)
}

interface ScheduleModalsProps {
  // Modal states
  scheduleModal: ScheduleModalState;
  dayShiftsModal: DayShiftsModalState;
  dayShifts: Shift[];
  employees: Employee[];

  // Handlers
  onCloseScheduleModal: () => void;
  onCloseDayShiftsModal: () => void;
  onEditShift: (shift: Shift) => void;
  onAddShift: () => void;
  onSaveShift: (data: CreateShiftInput) => Promise<ShiftOperationResult>;
  onUpdateShift: (id: string, data: Partial<Shift>) => Promise<ShiftOperationResult>;
  onDeleteShift: (id: string) => Promise<ShiftOperationResult>;
}

export function ScheduleModals({
  scheduleModal,
  dayShiftsModal,
  dayShifts,
  employees,
  onCloseScheduleModal,
  onCloseDayShiftsModal,
  onEditShift,
  onAddShift,
  onSaveShift,
  onUpdateShift,
  onDeleteShift,
}: ScheduleModalsProps) {
  return (
    <>
      {/* Day Shifts Modal - Shows all shifts for a specific day */}
      <DayShiftsModal
        open={dayShiftsModal.isOpen}
        onClose={onCloseDayShiftsModal}
        date={dayShiftsModal.date}
        shifts={dayShifts}
        onEditShift={onEditShift}
        onDeleteShift={onDeleteShift}
        onAddShift={onAddShift}
      />

      {/* Shift Modal - Create/Edit individual shift */}
      <ShiftModal
        open={scheduleModal.isOpen}
        onClose={onCloseScheduleModal}
        onSave={onSaveShift}
        onUpdate={onUpdateShift}
        onDelete={onDeleteShift}
        employees={employees}
        selectedDate={scheduleModal.selectedDate}
        existingShift={scheduleModal.selectedShift}
        defaultEmployeeId={scheduleModal.defaultEmployeeId}
        defaultShiftType={scheduleModal.defaultShiftType}
      />
    </>
  );
}
