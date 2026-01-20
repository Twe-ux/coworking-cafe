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
import { ReservationDialog } from "../reservations/ReservationDialog";
import type { Booking, BookingStatus } from "@/types/booking";

const spaceTypeColors: Record<string, string> = {
  "open-space": "bg-blue-500",
  "salle-verriere": "bg-green-500",
  "salle-etage": "bg-orange-500",
  evenementiel: "bg-red-500",
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

export function CalendarAltClient() {
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
    setSelectedDate(date);
    if (dayBookings.length === 1) {
      setSelectedBooking(dayBookings[0]);
      setDialogOpen(true);
    } else if (dayBookings.length === 0) {
      setSelectedBooking(null);
      setDialogOpen(true);
    }
  };

  const handleDialogSuccess = () => {
    setMessage({
      type: "success",
      text: selectedBooking ? "Réservation mise à jour" : "Réservation créée",
    });
    fetchBookings();
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
    if (dayBookings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1 p-1">
        {dayBookings.slice(0, 3).map((booking) => {
          const spaceType = getSpaceType(booking.spaceName);
          const colorClass = spaceTypeColors[spaceType];

          return (
            <div
              key={booking._id}
              className={`${colorClass} text-white rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBooking(booking);
                setDialogOpen(true);
              }}
            >
              <div className="font-semibold truncate">{booking.spaceName}</div>
              <div className="truncate opacity-90">{booking.clientName}</div>
              {booking.startTime && (
                <div className="text-[10px] opacity-80">
                  {booking.startTime} - {booking.endTime}
                </div>
              )}
            </div>
          );
        })}

        {dayBookings.length > 3 && (
          <div className="text-xs text-center text-muted-foreground">
            +{dayBookings.length - 3} autres
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
          Calendrier
        </h1>
        <p className="text-muted-foreground mt-2">
          Vue calendrier mensuel des réservations
        </p>
      </div>

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        booking={selectedBooking}
        onSuccess={handleDialogSuccess}
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
        cellHeight={120}
        legendComponent={
          <div className="flex gap-4 flex-wrap">
            {Object.entries(spaceTypeLabels).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${spaceTypeColors[type]}`} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
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
