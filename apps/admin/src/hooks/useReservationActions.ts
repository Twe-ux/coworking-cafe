import { useState } from "react";

interface UseReservationActionsReturn {
  processingId: string | null;
  actionType: "present" | "noshow" | null;
  dialogOpen: boolean;
  pendingBookingId: string | null;
  pendingAction: "present" | "noshow" | null;
  handleMarkPresent: (bookingId: string) => void;
  handleMarkNoShow: (bookingId: string) => void;
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

  const handleMarkPresent = (bookingId: string) => {
    if (processingId) return;
    setPendingBookingId(bookingId);
    setPendingAction("present");
    setDialogOpen(true);
  };

  const handleMarkNoShow = (bookingId: string) => {
    if (processingId) return;
    setPendingBookingId(bookingId);
    setPendingAction("noshow");
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
  };

  return {
    processingId,
    actionType,
    dialogOpen,
    pendingBookingId,
    pendingAction,
    handleMarkPresent,
    handleMarkNoShow,
    confirmAction,
    cancelAction,
  };
}
