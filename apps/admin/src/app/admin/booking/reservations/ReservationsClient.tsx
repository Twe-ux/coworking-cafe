"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Plus,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Users,
  Clock,
  Inbox,
  ClockIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ReservationsSkeleton } from "./ReservationsSkeleton";
import { ReservationDialog } from "./ReservationDialog";
import { ReservationDetailModal } from "./ReservationDetailModal";
import type { Booking, BookingStatus } from "@/types/booking";
import {
  getStatusLabel,
  getStatusBadgeClass,
  getReservationTypeLabel,
  getReservationTypeBadgeClass,
  formatDate,
  formatPrice,
} from "./utils";
import {
  useBookings,
  useConfirmBooking,
  useCancelBooking,
} from "@/hooks/useBookings";

/**
 * Get border class based on booking status (like EmployeeCard)
 */
function getBorderClass(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "border-l-4 border-l-green-500";
    case "pending":
      return "border-l-4 border-l-orange-500";
    case "cancelled":
      return "border-l-4 border-l-red-500";
    default:
      return "border-l-4 border-l-gray-300";
  }
}

export function ReservationsClient() {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "pending",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  // Quick cancel dialog state
  const [quickCancelDialogOpen, setQuickCancelDialogOpen] = useState(false);
  const [quickCancelBookingId, setQuickCancelBookingId] = useState<string | null>(null);
  const [quickCancelReason, setQuickCancelReason] = useState("");

  // Load all bookings to calculate stats
  const {
    data: allBookings = [],
    isLoading: loading,
    error,
  } = useBookings({ status: "all" });
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();

  // Calculate stats from all bookings
  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === "pending").length,
      confirmed: allBookings.filter((b) => b.status === "confirmed").length,
      cancelled: allBookings.filter((b) => b.status === "cancelled").length,
    };
  }, [allBookings]);

  // Filter bookings based on selected status
  const bookings = useMemo(() => {
    if (statusFilter === "all") return allBookings;
    return allBookings.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

  const handleCreate = () => {
    setSelectedBooking(null);
    setDialogOpen(true);
  };

  const handleRowClick = (booking: Booking) => {
    setDetailBooking(booking);
    setDetailModalOpen(true);
  };

  const handleDialogSuccess = () => {
    setMessage({
      type: "success",
      text: selectedBooking ? "Réservation mise à jour" : "Réservation créée",
    });
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

  // Quick cancel from list - opens dialog for reason
  const handleQuickCancelClick = (bookingId: string) => {
    setQuickCancelBookingId(bookingId);
    setQuickCancelReason("");
    setQuickCancelDialogOpen(true);
  };

  const handleQuickCancelConfirm = async () => {
    if (quickCancelBookingId) {
      await handleCancel(
        quickCancelBookingId,
        quickCancelReason || "Annulée par l'administrateur"
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

  if (loading) {
    return <ReservationsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Erreur lors du chargement des réservations"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Réservations
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérer les réservations clients
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        onSuccess={handleDialogSuccess}
      />

      <ReservationDetailModal
        booking={detailBooking}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isConfirming={confirmBooking.isPending}
        isCancelling={cancelBooking.isPending}
      />

      {/* Quick Cancel Dialog */}
      <Dialog open={quickCancelDialogOpen} onOpenChange={handleQuickCancelClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Raison de l'annulation (optionnel)</Label>
              <Textarea
                id="cancelReason"
                placeholder="Ex: Indisponibilité de l'espace, demande du client..."
                value={quickCancelReason}
                onChange={(e) => setQuickCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleQuickCancelClose}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleQuickCancelConfirm}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? "Annulation..." : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "pending" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <ClockIcon className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "confirmed" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setStatusFilter("confirmed")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "cancelled" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => setStatusFilter("cancelled")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Inbox className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {bookings.length === 0 ? (
        <Alert>
          <AlertDescription>Aucune réservation trouvée.</AlertDescription>
        </Alert>
      ) : (
        <>
          <CardHeader className="px-0">
            <CardTitle>Liste des réservations ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0">
            {bookings.map((booking) => (
              <Card
                key={booking._id}
                className={`${getBorderClass(booking.status)} cursor-pointer hover:bg-muted/50 transition-colors`}
                onClick={() => handleRowClick(booking)}
              >
                <CardContent className="py-3 px-4 ">
                  <div className="flex items-center justify-between">
                    {/* Colonnes alignées */}
                    <div className="flex items-center text-sm">
                      {/* Col 1: Espace */}
                      <div className="w-[100px] truncate">
                        <span className="font-bold">{booking.spaceName}</span>
                      </div>

                      {/* Col 2: Statut */}
                      <div className="w-[100px]">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(booking.status)}
                        >
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      {/* Col 3: Client */}
                      <div className="w-[175px] truncate">
                        <span className="font-semibold text-blue-600">
                          {booking.clientName || "Client"}
                        </span>
                      </div>

                      {/* Col 4: Type */}
                      <div className="w-[100px]">
                        <Badge
                          variant="outline"
                          className={getReservationTypeBadgeClass(
                            booking.reservationType,
                          )}
                        >
                          {getReservationTypeLabel(booking.reservationType)}
                        </Badge>
                      </div>

                      {/* Col 5: Date */}
                      <div className="w-[110px] flex items-center gap-1 font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(booking.startDate)}
                      </div>

                      {/* Col 6: Heures */}
                      <div className="w-[120px]">
                        {booking.startTime && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {booking.startTime}
                            {(booking.reservationType === "hourly" || !booking.reservationType) &&
                              booking.endTime &&
                              `-${booking.endTime}`}
                          </span>
                        )}
                      </div>

                      {/* Col 7: Personnes */}
                      <div className="w-[70px] flex items-center gap-1 font-medium text-foreground">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {booking.numberOfPeople}
                      </div>
                    </div>

                    {/* Right: Prix + Actions */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary w-[80px] text-right">
                        {formatPrice(booking.totalPrice)}
                      </span>

                      {/* Boutons icônes - largeur fixe pour alignement */}
                      <div
                        className="flex items-center gap-1 w-[72px] justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() =>
                                booking._id && handleConfirm(booking._id)
                              }
                              disabled={confirmBooking.isPending}
                              title="Valider"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() =>
                                booking._id && handleQuickCancelClick(booking._id)
                              }
                              disabled={cancelBooking.isPending}
                              title="Annuler"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() =>
                              booking._id && handleQuickCancelClick(booking._id)
                            }
                            disabled={cancelBooking.isPending}
                            title="Annuler"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </>
      )}
    </div>
  );
}
