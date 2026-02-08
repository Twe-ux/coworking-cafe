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
        {
          method: "POST",
          credentials: "include" // Include cookies for authentication
        }
      );
      const data = await response.json();
      console.log("[useReservationActions] Mark present response:", data);
      if (data.success) {
        console.log("[useReservationActions] Calling onSuccess callback");
        options?.onSuccess?.();
      } else {
        console.error("[useReservationActions] Mark present failed:", data);
      }
    } catch (error) {
      console.error("[useReservationActions] Mark present error:", error);
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
        {
          method: "POST",
          credentials: "include" // Include cookies for authentication
        }
      );
      const data = await response.json();
      console.log("[useReservationActions] Mark no-show response:", data);
      if (data.success) {
        console.log("[useReservationActions] Calling onSuccess callback");
        options?.onSuccess?.();
      } else {
        console.error("[useReservationActions] Mark no-show failed:", data);
      }
    } catch (error) {
      console.error("[useReservationActions] Mark no-show error:", error);
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
