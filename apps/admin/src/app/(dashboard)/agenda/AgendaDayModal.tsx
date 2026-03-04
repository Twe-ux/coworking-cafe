"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types/booking";
import { Calendar, Clock, UserCheck, UserX, Users } from "lucide-react";

interface AgendaDayModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | string;
  bookings: Booking[];
  onMarkPresent: (bookingId: string) => void;
  onMarkNoShow: (bookingId: string) => void;
  isMarkingPresent?: boolean;
  isMarkingNoShow?: boolean;
}

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

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Présent",
  "no-show": "No-show",
};

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    completed: "bg-green-50 text-green-700 border-green-200",
    "no-show": "bg-red-50 text-red-700 border-red-200",
  };
  return classes[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

export function AgendaDayModal({
  open,
  onClose,
  date,
  bookings,
  onMarkPresent,
  onMarkNoShow,
  isMarkingPresent = false,
  isMarkingNoShow = false,
}: AgendaDayModalProps) {
  const [activeTab, setActiveTab] = useState("ongoing");

  const dateObj = typeof date === "string" ? new Date(date + "T12:00:00") : date;
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Sort by time within same date
  const sortByTime = (a: Booking, b: Booking) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;

    const timeA = a.startTime.split(":").map(Number);
    const timeB = b.startTime.split(":").map(Number);
    const minutesA = timeA[0] * 60 + (timeA[1] || 0);
    const minutesB = timeB[0] * 60 + (timeB[1] || 0);

    return minutesA - minutesB;
  };

  // Separate bookings by tab
  const ongoingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === "confirmed")
      .sort(sortByTime);
  }, [bookings]);

  const historyBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === "completed" || b.status === "no-show")
      .sort(sortByTime);
  }, [bookings]);

  const renderBookingCard = (booking: Booking, showActions: boolean, showStatusBadge = false) => {
    const spaceType = booking.spaceType || "open-space";
    const spaceColor = spaceTypeColors[spaceType] || spaceTypeColors["open-space"];
    const spaceLabel = spaceTypeLabels[spaceType] || spaceType;
    const displayName = booking.clientCompany || booking.clientName;

    return (
      <div
        key={booking._id}
        className="flex items-center justify-between py-2 px-3 border-b last:border-b-0 hover:bg-green-50"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-1 h-12 rounded ${spaceColor}`} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{spaceLabel}</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm font-semibold">{displayName}</span>
              {showStatusBadge && (
                <Badge variant="outline" className={getStatusBadgeClass(booking.status)}>
                  {statusLabels[booking.status] || booking.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {booking.startTime && booking.endTime ? (
                <>
                  <Clock className="h-3 w-3" />
                  <span>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </>
              ) : (
                <span>Journée complète</span>
              )}
              <span>·</span>
              <Users className="h-3 w-3" />
              <span>{booking.numberOfPeople} pers.</span>
            </div>
          </div>
        </div>

        {showActions && !booking.isAdminBooking && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
              onClick={() => booking._id && onMarkPresent(booking._id)}
              disabled={isMarkingPresent}
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Présent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-orange-500 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
              onClick={() => booking._id && onMarkNoShow(booking._id)}
              disabled={isMarkingNoShow}
            >
              <UserX className="h-3 w-3 mr-1" />
              No-show
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Réservations - {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Aucune réservation pour ce jour</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ongoing">
                  En cours ({ongoingBookings.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  Historique ({historyBookings.length})
                </TabsTrigger>
              </TabsList>

              {/* Onglet En cours */}
              <TabsContent value="ongoing" className="mt-4 space-y-4">
                {ongoingBookings.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">Aucune réservation confirmée</p>
                  </div>
                ) : (
                  <Card className="border-green-300">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border-b rounded-t-2xl border-green-300">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <h3 className="text-sm font-semibold text-green-700">
                          Confirmées ({ongoingBookings.length})
                        </h3>
                      </div>
                      <div>
                        {ongoingBookings.map((booking) =>
                          renderBookingCard(booking, true, false)
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Onglet Historique */}
              <TabsContent value="history" className="mt-4 space-y-4">
                {historyBookings.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p className="text-sm">Aucune réservation dans l'historique</p>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div>
                        {historyBookings.map((booking) =>
                          renderBookingCard(booking, false, true)
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
