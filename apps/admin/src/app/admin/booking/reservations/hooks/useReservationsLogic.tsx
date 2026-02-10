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

  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    };
  }, [allBookings]);

  const availableMonths = useMemo(() => {
    return Array.from(
      new Set(
        allBookings
          .map((b) => b.startDate?.substring(0, 7) || "")
          .filter((month) => month.length === 7) // Filter valid YYYY-MM format only
      )
    ).sort((a, b) => b.localeCompare(a)); // Descending order
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

    // Filter by month (YYYY-MM format)
    if (monthFilter !== "all" && monthFilter.trim()) {
      filtered = filtered.filter((b) => b.startDate.startsWith(monthFilter));
    }

    // Sort by date and time
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Helper to sort by time within same date
    const sortByTime = (a: typeof filtered[0], b: typeof filtered[0], ascending = true) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;

      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      const minutesA = timeA[0] * 60 + (timeA[1] || 0);
      const minutesB = timeB[0] * 60 + (timeB[1] || 0);

      return ascending ? minutesA - minutesB : minutesB - minutesA;
    };

    // Sort based on selected order
    if (sortOrder === "smart") {
      // Smart sorting: today first, then future, then past
      const todayBookings = filtered.filter(b => b.startDate === today);
      const futureBookings = filtered.filter(b => b.startDate > today);
      const pastBookings = filtered.filter(b => b.startDate < today);

      // Sort each group
      todayBookings.sort((a, b) => sortByTime(a, b, true)); // Ascending time
      futureBookings.sort((a, b) => {
        if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate); // Ascending date
        return sortByTime(a, b, true); // Ascending time
      });
      pastBookings.sort((a, b) => {
        if (a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate); // Descending date
        return sortByTime(a, b, false); // Descending time
      });

      return [...todayBookings, ...futureBookings, ...pastBookings];
    } else if (sortOrder === "desc") {
      // Descending: most recent first
      return filtered.sort((a, b) => {
        if (a.startDate !== b.startDate) return b.startDate.localeCompare(a.startDate); // Descending
        return sortByTime(a, b, false); // Descending time
      });
    } else {
      // Ascending: oldest first
      return filtered.sort((a, b) => {
        if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate); // Ascending
        return sortByTime(a, b, true); // Ascending time
      });
    }
  }, [allBookings, statusFilter, nameFilter, dateFilter, monthFilter, sortOrder]);
  }, [allBookings, statusFilter, nameFilter, dateFilter, monthFilter]);

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
    bookings,
    stats,
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
