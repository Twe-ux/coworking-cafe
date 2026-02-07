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
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "pending",
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [quickCancelDialogOpen, setQuickCancelDialogOpen] = useState(false);
  const [quickCancelBookingId, setQuickCancelBookingId] = useState<
    string | null
  >(null);
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

  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    };
  }, [allBookings]);

  const bookings = useMemo(() => {
    if (statusFilter === "all") return allBookings;
    return allBookings.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

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

  const handleCancel = async (bookingId: string, reason: string) => {
    try {
      await cancelBooking.mutateAsync({ bookingId, reason });
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
    setQuickCancelBookingId(bookingId);
    setQuickCancelReason("");
    setQuickCancelDialogOpen(true);
  };

  const handleQuickCancelConfirm = async () => {
    if (quickCancelBookingId) {
      await handleCancel(
        quickCancelBookingId,
        quickCancelReason || "Annulée par l'administrateur",
      );
      setQuickCancelDialogOpen(false);
      setQuickCancelBookingId(null);
      setQuickCancelReason("");
    }
  };

  const handleQuickCancelClose = () => {
    setQuickCancelDialogOpen(false);
    setQuickCancelBookingId(null);
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
    statusFilter,
    setStatusFilter,
    detailModalOpen,
    setDetailModalOpen,
    detailBooking,
    quickCancelDialogOpen,
    quickCancelReason,
    setQuickCancelReason,
    editDialogOpen,
    setEditDialogOpen,
    editBooking,
    createDialogOpen,
    setCreateDialogOpen,

    // Data
    allBookings,
    bookings,
    stats,
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
