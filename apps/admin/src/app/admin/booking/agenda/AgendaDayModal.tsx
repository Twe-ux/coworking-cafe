"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Check,
  Copy,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import type { Booking } from "@/types/booking";

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
  "salle-verriere": "bg-green-500",
  "salle-etage": "bg-purple-500",
  evenementiel: "bg-red-500",
};

function getSpaceType(spaceName?: string): string {
  if (!spaceName) return "open-space";
  const lower = spaceName.toLowerCase();
  if (lower.includes("verriere")) return "salle-verriere";
  if (lower.includes("etage")) return "salle-etage";
  if (lower.includes("evenement")) return "evenementiel";
  return "open-space";
}

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
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const dateObj = typeof date === "string" ? new Date(date + "T12:00:00") : date;
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleCopyEmail = async (email: string, bookingId: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmailId(bookingId);
      setTimeout(() => setCopiedEmailId(null), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Aucune réservation confirmée</p>
            </div>
          ) : (
            bookings.map((booking) => {
              const spaceType = getSpaceType(booking.spaceName);
              const spaceColor = spaceTypeColors[spaceType];

              return (
                <div
                  key={booking._id}
                  className="flex items-center justify-between py-2 px-3 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-1 h-12 rounded ${spaceColor}`} />
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {booking.spaceName}
                        </span>
                        <span className="text-sm text-muted-foreground">·</span>
                        <span className="text-sm font-semibold">
                          {booking.clientName}
                        </span>
                        {booking.clientEmail && (
                          <button
                            onClick={() =>
                              booking._id &&
                              handleCopyEmail(booking.clientEmail!, booking._id)
                            }
                            className="h-5 w-5 p-0.5 rounded hover:bg-muted transition-colors"
                            title={
                              copiedEmailId === booking._id
                                ? "Copié !"
                                : booking.clientEmail
                            }
                          >
                            {copiedEmailId === booking._id ? (
                              <Check className="h-full w-full text-green-600" />
                            ) : (
                              <Copy className="h-full w-full text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
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

                  {!booking.isAdminBooking && (
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
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
