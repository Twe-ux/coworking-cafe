"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AgendaDayModal } from "./AgendaDayModal";
import { AgendaPageSkeleton } from "./AgendaPageSkeleton";
import type { Booking } from "@/types/booking";

const spaceTypeColors: Record<string, string> = {
  "open-space": "bg-blue-500",
  "salle-verriere": "bg-green-500",
  "salle-etage": "bg-purple-500",
  evenementiel: "bg-red-500",
};

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open Space",
  "salle-verriere": "Verrière",
  "salle-etage": "Étage",
  evenementiel: "Événementiel",
};

function getSpaceType(spaceName?: string): string {
  if (!spaceName) return "open-space";
  const lower = spaceName.toLowerCase();
  if (lower.includes("verriere")) return "salle-verriere";
  if (lower.includes("etage")) return "salle-etage";
  if (lower.includes("evenement")) return "evenementiel";
  return "open-space";
}

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

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: "confirmed" });

      if (!isAuthenticated) {
        params.set("public", "true");
      }

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

  const handleMarkPresent = async (bookingId: string) => {
    if (
      !confirm(
        "Confirmer la présence du client ? Cela libérera l'empreinte bancaire et enverra un email de confirmation.",
      )
    )
      return;

    try {
      setIsMarkingPresent(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-present`,
        { method: "POST" },
      );
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Client marqué comme présent",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la confirmation",
        });
      }
    } catch {
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
        "Marquer comme no-show ? Cela capturera l'empreinte bancaire et enverra un email au client.",
      )
    )
      return;

    try {
      setIsMarkingNoShow(true);
      const response = await fetch(
        `/api/booking/reservations/${bookingId}/mark-noshow`,
        { method: "POST" },
      );
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Client marqué comme no-show",
        });
        fetchBookings();
        setDayModalOpen(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du traitement",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erreur lors du traitement du no-show",
      });
    } finally {
      setIsMarkingNoShow(false);
    }
  };

  const renderCell = (date: Date, dayBookings: Booking[]) => {
    if (dayBookings.length === 0) return null;

    return (
      <div className="h-[88px] overflow-hidden px-1 space-y-1">
        {dayBookings.slice(0, 3).map((booking) => {
          const spaceType = getSpaceType(booking.spaceName);
          const spaceColor = spaceTypeColors[spaceType];

          return (
            <div
              key={booking._id}
              className={`${spaceColor} text-white rounded px-2 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-between gap-2`}
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

        {dayBookings.length > 3 && (
          <div className="text-xs text-center text-muted-foreground py-0.5">
            +{dayBookings.length - 3} réservation
            {dayBookings.length - 3 > 1 ? "s" : ""}
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
    </div>
  );
}
