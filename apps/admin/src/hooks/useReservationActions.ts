import { useState } from "react";

interface UseReservationActionsReturn {
  processingId: string | null;
  actionType: "present" | "noshow" | null;
  handleMarkPresent: (bookingId: string) => Promise<void>;
  handleMarkNoShow: (bookingId: string) => Promise<void>;
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

  const handleMarkPresent = async (bookingId: string) => {
    if (processingId) return;

    if (
      !confirm(
        "Confirmer la présence du client ? Cela libérera l'empreinte bancaire et enverra un email de confirmation."
      )
    )
      return;

    try {
      setProcessingId(bookingId);
      setActionType("present");
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-present`,
        { method: "POST" }
      );
      const data = await response.json();
      if (data.success) {
        options?.onSuccess?.();
      }
    } catch {
      // Silent fail
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (processingId) return;

    if (
      !confirm(
        "Marquer comme no-show ? Cela capturera l'empreinte bancaire et enverra un email au client."
      )
    )
      return;

    try {
      setProcessingId(bookingId);
      setActionType("noshow");
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-noshow`,
        { method: "POST" }
      );
      const data = await response.json();
      if (data.success) {
        options?.onSuccess?.();
      }
    } catch {
      // Silent fail
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  return {
    processingId,
    actionType,
    handleMarkPresent,
    handleMarkNoShow,
  };
}
