import { useState, useMemo } from "react";
import type { Booking, BookingStatus } from "@/types/booking";
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
} from "@/hooks/useBookings";

export function useReservationsLogic() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [monthFilter, setMonthFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"smart" | "asc" | "desc">("smart");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [quickCancelDialogOpen, setQuickCancelDialogOpen] = useState(false);
  const [quickCancelBooking, setQuickCancelBooking] = useState<Booking | null>(null);
  const [quickCancelReason, setQuickCancelReason] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const {
    data: allBookings = [],
    isLoading: loading,
    error,
    refetch,
  } = useBookings({ status: "all" });
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(
        allBookings
          .map((b) => b.startDate?.substring(0, 7) || "")
          .filter((month) => month.length === 7) // Filter valid YYYY-MM format only
      )
    ).sort((a, b) => b.localeCompare(a)); // Descending order
  }, [allBookings]);

  const handleRowClick = (booking: Booking) => {
    setDetailBooking(booking);
    setDetailModalOpen(true);
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      await confirmBooking.mutateAsync(bookingId);
      setMessage({
        type: "success",
        text: "Réservation confirmée avec succès",
      });
      setDetailModalOpen(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de la confirmation",
      });
    }
  };

  const handleCancel = async (bookingId: string, reason: string, skipCapture?: boolean) => {
    try {
      await cancelBooking.mutateAsync({ bookingId, reason, skipCapture });
      setMessage({ type: "success", text: "Réservation annulée" });
      setDetailModalOpen(false);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'annulation",
      });
    }
  };

  const handleQuickCancelClick = (bookingId: string) => {
    const booking = allBookings.find(b => b._id === bookingId);
    if (booking) {
      setQuickCancelBooking(booking);
      setQuickCancelReason("");
      setQuickCancelDialogOpen(true);
    }
  };

  const handleQuickCancelConfirm = async (skipCapture: boolean) => {
    if (quickCancelBooking?._id) {
      await handleCancel(
        quickCancelBooking._id,
        quickCancelReason || "Annulée par l'administrateur",
        skipCapture,
      );
      setQuickCancelDialogOpen(false);
      setQuickCancelBooking(null);
      setQuickCancelReason("");
    }
  };

  const handleQuickCancelClose = () => {
    setQuickCancelDialogOpen(false);
    setQuickCancelBooking(null);
    setQuickCancelReason("");
  };

  const handleEditClick = (booking: Booking) => {
    setEditBooking(booking);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setMessage({
      type: "success",
      text: "Réservation modifiée avec succès",
    });
    refetch();
  };

  return {
    // State
    message,
    setMessage,
    monthFilter,
    setMonthFilter,
    sortOrder,
    setSortOrder,
    detailModalOpen,
    setDetailModalOpen,
    detailBooking,
    quickCancelDialogOpen,
    quickCancelBooking,
    quickCancelReason,
    setQuickCancelReason,
    editDialogOpen,
    setEditDialogOpen,
    editBooking,
    createDialogOpen,
    setCreateDialogOpen,

    // Data
    allBookings,
    availableMonths,
    loading,
    error,

    // Handlers
    handleRowClick,
    handleConfirm,
    handleCancel,
    handleQuickCancelClick,
    handleQuickCancelConfirm,
    handleQuickCancelClose,
    handleEditClick,
    handleEditSuccess,
    refetch,

    // Mutations
    confirmBooking,
    cancelBooking,
  };
}
