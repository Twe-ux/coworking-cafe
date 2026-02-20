"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { StyledAlert } from "@/components/ui/styled-alert";
import {
  Calendar as CalendarIcon,
} from "lucide-react";
import { AgendaDayModal } from "./AgendaDayModal";
import { AgendaPageSkeleton } from "./AgendaPageSkeleton";
import type { Booking } from "@/types/booking";
import { ConfirmActionDialog } from "@/components/booking/ConfirmActionDialog";

const spaceTypeColors: Record<string, string> = {
  "open-space": "bg-blue-500",
  "meeting-room-glass": "bg-green-500",
  "meeting-room-floor": "bg-purple-500",
  "event-space": "bg-red-500",
  // Legacy keys (backward compatibility)
  "salle-verriere": "bg-green-500",
  "salle-etage": "bg-purple-500",
  "evenementiel": "bg-red-500",
};

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open Space",
  "meeting-room-glass": "Verrière",
  "meeting-room-floor": "Étage",
  "event-space": "Événementiel",
  // Legacy keys (backward compatibility)
  "salle-verriere": "Verrière",
  "salle-etage": "Étage",
  "evenementiel": "Événementiel",
};

export function AgendaClient() {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalDate, setDayModalDate] = useState<Date>(new Date());
  const [dayModalBookings, setDayModalBookings] = useState<Booking[]>([]);
  const [isMarkingPresent, setIsMarkingPresent] = useState(false);
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"present" | "noshow" | null>(null);
  const [pendingIsAdminBooking, setPendingIsAdminBooking] = useState<boolean>(false);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (!isAuthenticated) {
        params.set("public", "true");
        params.set("status", "confirmed"); // Public mode: confirmed only
      }
      // Authenticated staff: fetch all statuses (confirmed, completed, no-show)

      const response = await fetch(`/api/booking/reservations?${params}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data || []);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des réservations",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    fetchBookings();
  }, [currentDate, fetchBookings, sessionStatus]);

  const handleCellClick = (date: Date, dayBookings: Booking[]) => {
    setDayModalDate(date);
    setDayModalBookings(dayBookings);
    setDayModalOpen(true);
  };

  const handleMarkPresent = (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setPendingBookingId(bookingId);
    setPendingAction("present");
    setPendingIsAdminBooking(booking?.isAdminBooking || false);
    setConfirmDialogOpen(true);
  };

  const handleMarkNoShow = (bookingId: string) => {
    const booking = bookings.find((b) => b._id === bookingId);
    setPendingBookingId(bookingId);
    setPendingAction("noshow");
    setPendingIsAdminBooking(booking?.isAdminBooking || false);
    setConfirmDialogOpen(true);
  };

  const confirmActionHandler = async () => {
    if (!pendingBookingId || !pendingAction) return;

    try {
      const isPresent = pendingAction === "present";
      if (isPresent) {
        setIsMarkingPresent(true);
      } else {
        setIsMarkingNoShow(true);
      }

      const endpoint = isPresent ? "mark-present" : "mark-noshow";
      const response = await fetch(
        `/api/booking/reservations/${pendingBookingId}/${endpoint}`,
        { method: "POST" },
      );
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: isPresent ? "Client marqué comme présent" : "Client marqué comme no-show",
        });
        fetchBookings();
        setDayModalOpen(false);
        setConfirmDialogOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du traitement",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du traitement",
      });
    } finally {
      setIsMarkingPresent(false);
      setIsMarkingNoShow(false);
      setPendingBookingId(null);
      setPendingAction(null);
    }
  };

  const cancelActionHandler = () => {
    setConfirmDialogOpen(false);
    setPendingBookingId(null);
    setPendingAction(null);
    setPendingIsAdminBooking(false);
  };

  const renderCell = (date: Date, dayBookings: Booking[]) => {
    // Only show confirmed bookings in calendar cells
    const confirmedBookings = dayBookings.filter((b) => b.status === "confirmed");

    if (confirmedBookings.length === 0) return null;

    return (
      <div className="h-[88px] overflow-hidden px-1 space-y-1">
        {confirmedBookings.slice(0, 3).map((booking) => {
          const spaceType = booking.spaceType || "open-space";
          const spaceColor = spaceTypeColors[spaceType] || spaceTypeColors["open-space"];

          return (
            <div
              key={booking._id}
              className={`${spaceColor} text-white rounded px-2 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-between gap-2`}
            >
              <span className="truncate font-medium">
                {booking.clientCompany || booking.clientName}
              </span>
              {booking.startTime && (
                <span className="text-[10px] opacity-90 whitespace-nowrap">
                  {booking.startTime}-{booking.endTime}
                </span>
              )}
            </div>
          );
        })}

        {confirmedBookings.length > 3 && (
          <div className="text-xs text-center text-muted-foreground py-0.5">
            +{confirmedBookings.length - 3} réservation
            {confirmedBookings.length - 3 > 1 ? "s" : ""}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <AgendaPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-8 h-8" />
          Agenda des réservations
        </h1>
      </div>

      <AgendaDayModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={dayModalDate}
        bookings={dayModalBookings}
        onMarkPresent={handleMarkPresent}
        onMarkNoShow={handleMarkNoShow}
        isMarkingPresent={isMarkingPresent}
        isMarkingNoShow={isMarkingNoShow}
      />

      {message && (
        <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
          {message.text}
        </StyledAlert>
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
          <div className="flex gap-4 flex-wrap items-center">
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
        }
      />

      <ConfirmActionDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => !open && cancelActionHandler()}
        onConfirm={confirmActionHandler}
        action={pendingAction || "present"}
        isProcessing={isMarkingPresent || isMarkingNoShow}
        isAdminBooking={pendingIsAdminBooking}
      />
    </div>
  );
}
