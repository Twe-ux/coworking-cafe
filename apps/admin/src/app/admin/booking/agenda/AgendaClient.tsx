"use client";

import { useState, useEffect } from "react";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { ReservationDialog } from "../reservations/reservation-dialog";
import { EditBookingDialog } from "../reservations/EditBookingDialog";
import { DayBookingsModal } from "./DayBookingsModal";
import { useSession } from "next-auth/react";
import type { Booking, BookingStatus } from "@/types/booking";

const spaceTypeColors: Record<string, string> = {
  "open-space": "bg-blue-500",
  "salle-verriere": "bg-green-500",
  "salle-etage": "bg-purple-500",
  evenementiel: "bg-red-500",
};

const spaceTypeBorderColors: Record<string, string> = {
  "open-space": "border-l-blue-500",
  "salle-verriere": "border-l-green-500",
  "salle-etage": "border-l-purple-500",
  evenementiel: "border-l-red-500",
};

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open Space",
  "salle-verriere": "Verrière",
  "salle-etage": "Étage",
  evenementiel: "Événementiel",
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export function AgendaClient() {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date>(new Date());
  const [dayModalBookings, setDayModalBookings] = useState<Booking[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMarkingPresent, setIsMarkingPresent] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [currentDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/booking/reservations");
      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des réservations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBooking(null);
    setDialogOpen(true);
  };

  const handleCellClick = (date: Date, dayBookings: Booking[]) => {
    // Filter out cancelled bookings for display
    const activeBookings = dayBookings.filter((b) => b.status !== "cancelled");

    // Always open day modal (even if empty)
    setDayModalDate(date);
    setDayModalBookings(activeBookings);
    setDayModalOpen(true);
  };

  const handleDialogSuccess = () => {
    setMessage({
      type: "success",
      text: selectedBooking ? "Réservation mise à jour" : "Réservation créée",
    });
    fetchBookings();
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      setIsConfirming(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/confirm`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réservation confirmée avec succès",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la confirmation",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la confirmation de la réservation",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async (bookingId: string, reason: string) => {
    try {
      setIsCancelling(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Réservation annulée avec succès",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de l'annulation",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de l'annulation de la réservation",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditBooking(booking);
    setDayModalOpen(false);
    setEditDialogOpen(true);
  };

  const handleCreateFromModal = () => {
    setSelectedDate(dayModalDate);
    setSelectedBooking(null);
    setDayModalOpen(false);
    setDialogOpen(true);
  };

  const handleMarkPresent = async (bookingId: string) => {
    if (
      !confirm(
        "Confirmer la présence du client ? Cela libérera l'empreinte bancaire et enverra un email de confirmation."
      )
    ) {
      return;
    }

    try {
      setIsMarkingPresent(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-present`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Client marqué comme présent - Empreinte bancaire libérée",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la confirmation de présence",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la confirmation de présence",
      });
    } finally {
      setIsMarkingPresent(false);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (
      !confirm(
        "Marquer comme no-show ? Cela capturera l'empreinte bancaire et enverra un email au client."
      )
    ) {
      return;
    }

    try {
      setIsMarkingNoShow(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-noshow`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Client marqué comme no-show - Empreinte bancaire capturée",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du traitement du no-show",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du traitement du no-show",
      });
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  const getSpaceType = (spaceName?: string): string => {
    if (!spaceName) return "open-space";
    const lower = spaceName.toLowerCase();
    if (lower.includes("verriere")) return "salle-verriere";
    if (lower.includes("etage")) return "salle-etage";
    if (lower.includes("evenement")) return "evenementiel";
    return "open-space";
  };

  const renderCell = (date: Date, dayBookings: Booking[], cellInfo: any) => {
    // Ne pas afficher les réservations annulées
    const activeBookings = dayBookings.filter((b) => b.status !== "cancelled");

    if (activeBookings.length === 0) {
      return null;
    }

    return (
      <div className="h-[88px] overflow-hidden px-1 space-y-1">
        {activeBookings.slice(0, 3).map((booking) => {
          const spaceType = getSpaceType(booking.spaceName);
          const spaceColor = spaceTypeColors[spaceType];
          const borderColor = spaceTypeBorderColors[spaceType];

          // Si en attente : fond orange avec bordure de la couleur de l'espace
          // Si confirmée : fond de la couleur de l'espace
          const bgColor =
            booking.status === "pending" ? "bg-orange-500" : spaceColor;
          const border =
            booking.status === "pending" ? `border-l-8 ${borderColor}` : "";

          return (
            <div
              key={booking._id}
              className={`${bgColor} ${border} text-white rounded px-2 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-between gap-2`}
            >
              <span className="truncate font-medium">{booking.clientName}</span>
              {booking.startTime && (
                <span className="text-[10px] opacity-90 whitespace-nowrap">
                  {booking.startTime}-{booking.endTime}
                </span>
              )}
            </div>
          );
        })}

        {activeBookings.length > 3 && (
          <div className="text-xs text-center text-muted-foreground py-0.5">
            +{activeBookings.length - 3} réservation
            {activeBookings.length - 3 > 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Agenda
        </h1>
        {/* <p className="text-muted-foreground mt-2">
          Vue calendrier mensuel des réservations
        </p> */}
      </div>

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        onSuccess={handleDialogSuccess}
      />

      <EditBookingDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        booking={editBooking}
        onSuccess={handleDialogSuccess}
      />

      <DayBookingsModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={dayModalDate}
        bookings={dayModalBookings}
        userRole={session?.user?.role || "staff"}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onEdit={handleEdit}
        onMarkPresent={handleMarkPresent}
        onMarkNoShow={handleMarkNoShow}
        onCreate={handleCreateFromModal}
        isConfirming={isConfirming}
        isCancelling={isCancelling}
        isMarkingPresent={isMarkingPresent}
        isMarkingNoShow={isMarkingNoShow}
      />

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

      <MonthlyCalendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        data={bookings}
        getDateForData={(booking) => booking.startDate}
        renderCell={renderCell}
        onCellClick={handleCellClick}
        showSidebar={false}
        cellHeight={129}
        legendComponent={
          <div className="flex gap-6 flex-wrap items-center">
            <div className="flex gap-4 flex-wrap">
              <span className="text-sm font-semibold text-muted-foreground">
                Espaces :
              </span>
              {Object.entries(spaceTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${spaceTypeColors[type]}`} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Statut :
              </span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-sm">En attente</span>
              </div>
            </div>
          </div>
        }
        actionButton={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle réservation
          </Button>
        }
      />
    </div>
  );
}
