import { useState } from "react";

interface UseReservationActionsReturn {
  processingId: string | null;
  actionType: "present" | "noshow" | null;
  dialogOpen: boolean;
  pendingBookingId: string | null;
  pendingAction: "present" | "noshow" | null;
  pendingIsAdminBooking: boolean;
  handleMarkPresent: (bookingId: string, isAdminBooking?: boolean) => void;
  handleMarkNoShow: (bookingId: string, isAdminBooking?: boolean) => void;
  confirmAction: () => Promise<void>;
  cancelAction: () => void;
}

interface UseReservationActionsOptions {
  onSuccess?: () => void;
}

export function useReservationActions(
  options?: UseReservationActionsOptions
): UseReservationActionsReturn {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"present" | "noshow" | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"present" | "noshow" | null>(null);
  const [pendingIsAdminBooking, setPendingIsAdminBooking] = useState<boolean>(false);

  const handleMarkPresent = (bookingId: string, isAdminBooking?: boolean) => {
    if (processingId) return;
    setPendingBookingId(bookingId);
    setPendingAction("present");
    setPendingIsAdminBooking(isAdminBooking || false);
    setDialogOpen(true);
  };

  const handleMarkNoShow = (bookingId: string, isAdminBooking?: boolean) => {
    if (processingId) return;
    setPendingBookingId(bookingId);
    setPendingAction("noshow");
    setPendingIsAdminBooking(isAdminBooking || false);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingBookingId || !pendingAction) return;

    try {
      setProcessingId(pendingBookingId);
      setActionType(pendingAction);

      const endpoint = pendingAction === "present" ? "mark-present" : "mark-noshow";
      const response = await fetch(
        `/api/booking/reservations/${pendingBookingId}/${endpoint}`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      const data = await response.json();
      console.log(`[useReservationActions] ${endpoint} response:`, data);

      if (data.success) {
        console.log("[useReservationActions] Calling onSuccess callback");
        options?.onSuccess?.();
        setDialogOpen(false);
      } else {
        console.error(`[useReservationActions] ${endpoint} failed:`, data);
      }
    } catch (error) {
      console.error(`[useReservationActions] ${pendingAction} error:`, error);
    } finally {
      setProcessingId(null);
      setActionType(null);
      setPendingBookingId(null);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setDialogOpen(false);
    setPendingBookingId(null);
    setPendingAction(null);
    setPendingIsAdminBooking(false);
  };

  return {
    processingId,
    actionType,
    dialogOpen,
    pendingBookingId,
    pendingAction,
    pendingIsAdminBooking,
    handleMarkPresent,
    handleMarkNoShow,
    confirmAction,
    cancelAction,
  };
}
