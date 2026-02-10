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
  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
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

  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    };
  }, [allBookings]);

  const bookings = useMemo(() => {
    let filtered = allBookings;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Filter by name (clientName or clientCompany)
    if (nameFilter.trim()) {
      const searchTerm = nameFilter.toLowerCase().trim();
      filtered = filtered.filter((b) => {
        const name = (b.clientName || "").toLowerCase();
        const company = (b.clientCompany || "").toLowerCase();
        return name.includes(searchTerm) || company.includes(searchTerm);
      });
    }

    // Filter by date (startDate)
    if (dateFilter.trim()) {
      filtered = filtered.filter((b) => b.startDate === dateFilter);
    }

    return filtered;
  }, [allBookings, statusFilter, nameFilter, dateFilter]);

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
    statusFilter,
    setStatusFilter,
    nameFilter,
    setNameFilter,
    dateFilter,
    setDateFilter,
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
