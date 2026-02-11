"use client";

import { useEffect } from "react";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ReservationsSkeleton } from "./ReservationsSkeleton";
import { ReservationDetailModal } from "./ReservationDetailModal";
import { ReservationDialog } from "./reservation-dialog";
import { EditBookingDialog } from "./EditBookingDialog";
import { ReservationsHeader } from "./components/ReservationsHeader";
import { ReservationsTabs } from "./components/ReservationsTabs";
import { QuickCancelDialog } from "./components/QuickCancelDialog";
import { useReservationsLogic } from "./hooks/useReservationsLogic";
import { markBadgeSeen } from "@/lib/utils/badge-seen";
import { triggerSidebarRefresh } from "@/lib/events/sidebar-refresh";

export function ReservationsClient() {
  // Mark bookings as seen when page loads → clears sidebar badge
  useEffect(() => {
    markBadgeSeen("bookings");
    triggerSidebarRefresh();
  }, []);
  const {
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
    allBookings,
    availableMonths,
    loading,
    error,
    handleRowClick,
    handleConfirm,
    handleCancel,
    handleQuickCancelClick,
    handleQuickCancelConfirm,
    handleQuickCancelClose,
    handleEditClick,
    handleEditSuccess,
    refetch,
    confirmBooking,
    cancelBooking,
  } = useReservationsLogic();

  if (loading) {
    return <ReservationsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <StyledAlert variant="destructive">
          {error instanceof Error
            ? error.message
            : "Erreur lors du chargement des réservations"}
        </StyledAlert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ReservationsHeader onCreateClick={() => setCreateDialogOpen(true)} />

      <ReservationDetailModal
        booking={detailBooking}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isConfirming={confirmBooking.isPending}
        isCancelling={cancelBooking.isPending}
      />

      <QuickCancelDialog
        open={quickCancelDialogOpen}
        onOpenChange={handleQuickCancelClose}
        reason={quickCancelReason}
        onReasonChange={setQuickCancelReason}
        onConfirm={handleQuickCancelConfirm}
        isCancelling={cancelBooking.isPending}
        bookingId={quickCancelBooking?._id || null}
        bookingStatus={quickCancelBooking?.status}
      />

      <EditBookingDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        booking={editBooking}
        onSuccess={handleEditSuccess}
      />

      {message && (
        <StyledAlert
          variant={message.type === "success" ? "success" : "destructive"}
        >
          {message.text}
        </StyledAlert>
      )}

      <ReservationsTabs
        bookings={allBookings}
        onRowClick={handleRowClick}
        onConfirm={handleConfirm}
        onEdit={handleEditClick}
        onCancel={handleQuickCancelClick}
        isConfirming={confirmBooking.isPending}
        isCancelling={cancelBooking.isPending}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        availableMonths={availableMonths}
      />

      <ReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setMessage({
            type: "success",
            text: "Réservation créée avec succès",
          });
        }}
      />
    </div>
  );
}
