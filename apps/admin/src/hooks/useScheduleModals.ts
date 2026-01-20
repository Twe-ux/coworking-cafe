"use client";

import { useCallback, useState } from "react";
import type { Shift, CreateShiftInput, UpdateShiftInput } from "@/types/shift";

// ==================== TYPES ====================

interface ScheduleModalState {
  isOpen: boolean;
  selectedDate: Date;
  selectedShift: Shift | null;
}

interface DayShiftsModalState {
  isOpen: boolean;
  date: Date;
}

/** Result type for shift operations matching existing modal interfaces */
interface ShiftOperationResult {
  success: boolean;
  data?: Shift;
  error?: string;
  details?: string | string[] | Record<string, string>;
}

interface UseScheduleModalsProps {
  createShift: (data: CreateShiftInput) => Promise<ShiftOperationResult>;
  updateShift: (id: string, data: UpdateShiftInput) => Promise<ShiftOperationResult>;
  deleteShift: (id: string) => Promise<ShiftOperationResult>;
  refreshShifts: () => void;
}

export interface UseScheduleModalsReturn {
  // Modal states
  scheduleModal: ScheduleModalState;
  dayShiftsModal: DayShiftsModalState;

  // Handlers
  handleCellClick: (date: Date, dayShifts: Shift[]) => void;
  handleShiftClick: (shift: Shift, e: React.MouseEvent) => void;
  handleEditShiftFromDay: (shift: Shift) => void;
  handleAddShiftFromDay: () => void;
  handleSaveShift: (data: CreateShiftInput) => Promise<ShiftOperationResult>;
  handleUpdateShift: (id: string, data: UpdateShiftInput) => Promise<ShiftOperationResult>;
  handleDeleteShift: (id: string) => Promise<ShiftOperationResult>;
  closeScheduleModal: () => void;
  closeDayShiftsModal: () => void;
}

/**
 * Hook for managing schedule modal states and handlers
 */
export function useScheduleModals({
  createShift,
  updateShift,
  deleteShift,
  refreshShifts,
}: UseScheduleModalsProps): UseScheduleModalsReturn {
  // Modal states
  const [scheduleModal, setScheduleModal] = useState<ScheduleModalState>({
    isOpen: false,
    selectedDate: new Date(),
    selectedShift: null,
  });

  const [dayShiftsModal, setDayShiftsModal] = useState<DayShiftsModalState>({
    isOpen: false,
    date: new Date(),
  });

  // ==================== HANDLERS ====================

  const handleCellClick = useCallback((date: Date, cellDayShifts: Shift[]) => {
    if (cellDayShifts.length === 0) {
      // No shifts: open creation modal directly
      setScheduleModal({
        isOpen: true,
        selectedDate: date,
        selectedShift: null,
      });
    } else {
      // Shifts exist: open day shifts modal
      setDayShiftsModal({
        isOpen: true,
        date,
      });
    }
  }, []);

  const handleShiftClick = useCallback((shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateValue = typeof shift.date === "string" ? new Date(shift.date) : shift.date;
    setDayShiftsModal({
      isOpen: true,
      date: dateValue,
    });
  }, []);

  const handleEditShiftFromDay = useCallback((shift: Shift) => {
    setDayShiftsModal((prev) => ({ ...prev, isOpen: false }));
    const dateValue = typeof shift.date === "string" ? new Date(shift.date) : shift.date;
    setScheduleModal({
      isOpen: true,
      selectedDate: dateValue,
      selectedShift: shift,
    });
  }, []);

  const handleAddShiftFromDay = useCallback(() => {
    setDayShiftsModal((prev) => {
      setScheduleModal({
        isOpen: true,
        selectedDate: prev.date,
        selectedShift: null,
      });
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleSaveShift = useCallback(
    async (data: CreateShiftInput): Promise<ShiftOperationResult> => {
      const result = await createShift(data);
      if (result.success) {
        refreshShifts();
      }
      return result;
    },
    [createShift, refreshShifts]
  );

  const handleUpdateShift = useCallback(
    async (id: string, data: UpdateShiftInput): Promise<ShiftOperationResult> => {
      const result = await updateShift(id, data);
      if (result.success) {
        refreshShifts();
      }
      return result;
    },
    [updateShift, refreshShifts]
  );

  const handleDeleteShift = useCallback(
    async (id: string): Promise<ShiftOperationResult> => {
      const result = await deleteShift(id);
      if (result.success) {
        refreshShifts();
        setScheduleModal((prev) => ({
          ...prev,
          isOpen: false,
          selectedShift: null,
        }));
      }
      return result;
    },
    [deleteShift, refreshShifts]
  );

  const closeScheduleModal = useCallback(() => {
    setScheduleModal((prev) => ({
      ...prev,
      isOpen: false,
      selectedShift: null,
    }));
  }, []);

  const closeDayShiftsModal = useCallback(() => {
    setDayShiftsModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    scheduleModal,
    dayShiftsModal,
    handleCellClick,
    handleShiftClick,
    handleEditShiftFromDay,
    handleAddShiftFromDay,
    handleSaveShift,
    handleUpdateShift,
    handleDeleteShift,
    closeScheduleModal,
    closeDayShiftsModal,
  };
}
