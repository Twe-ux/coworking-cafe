"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Booking } from "@/types/booking";
import {
  Calendar,
  Check,
  Edit2,
  MessageSquareMore,
  Plus,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { useState } from "react";
import { formatTimeDisplay } from "../reservations/utils";

function capitalize(name?: string): string {
  if (!name) return "";
  return name.replace(/(^|[\s-])[a-zA-ZÀ-ÿ]/g, (c) => c.toUpperCase());
}

interface DayBookingsModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | string;
  bookings: Booking[];
  userRole: string;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string, reason: string) => void;
  onEdit: (booking: Booking) => void;
  onMarkPresent: (bookingId: string) => void;
  onMarkNoShow: (bookingId: string) => void;
  onCreate: () => void;
  onDelete?: (bookingId: string) => void;
  isConfirming?: boolean;
  isCancelling?: boolean;
  isMarkingPresent?: boolean;
  isMarkingNoShow?: boolean;
  isDeleting?: boolean;
}

export function DayBookingsModal({
  open,
  onClose,
  date,
  bookings,
  userRole,
  onConfirm,
  onCancel,
  onEdit,
  onMarkPresent,
  onMarkNoShow,
  onCreate,
  onDelete,
  isConfirming = false,
  isCancelling = false,
  isMarkingPresent = false,
  isMarkingNoShow = false,
  isDeleting = false,
}: DayBookingsModalProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<
    string | null
  >(null);
  const [cancelReason, setCancelReason] = useState("");

  // Handle both Date objects and string dates
  const dateObj =
    typeof date === "string" ? new Date(date + "T12:00:00") : date;
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Separate bookings by status
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  // Check if user has full permissions (dev/admin/manager)
  const hasFullPermissions = ["dev", "admin", "manager"].includes(userRole);

  // Staff can only see confirmed bookings and mark presence
  const visibleBookings = hasFullPermissions ? bookings : confirmedBookings;

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingForCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedBookingForCancel) {
      onCancel(
        selectedBookingForCancel,
        cancelReason || "Annulée par l'administrateur",
      );
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedBookingForCancel(null);
    }
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelReason("");
    setSelectedBookingForCancel(null);
  };

  const renderBookingCard = (booking: Booking, isPending: boolean) => {
    const spaceTypeColors: Record<string, string> = {
      "open-space": "bg-blue-500",
      "salle-verriere": "bg-green-500",
      "salle-etage": "bg-purple-500",
      evenementiel: "bg-red-500",
    };

    const getSpaceType = (spaceName?: string): string => {
      if (!spaceName) return "open-space";
      const lower = spaceName.toLowerCase();
      if (lower.includes("verriere")) return "salle-verriere";
      if (lower.includes("etage")) return "salle-etage";
      if (lower.includes("evenement")) return "evenementiel";
      return "open-space";
    };

    const spaceType = getSpaceType(booking.spaceName);
    const spaceColor = spaceTypeColors[spaceType];

    return (
      <div
        key={booking._id}
        className="flex items-center justify-between py-2 px-3 border-b last:border-b-0 hover:bg-muted/50"
      >
        {/* Left: Space + Name + Time */}
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-1 h-12 rounded ${spaceColor}`} />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {capitalize(booking.spaceName)}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-semibold">
                {booking.clientCompany || booking.clientName}
              </span>
              {booking.notes && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                        <MessageSquareMore className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs border-red-500 border">
                      <p className="text-base whitespace-pre-wrap">
                        {booking.notes}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {booking.startTime && (
                <span>
                  {formatTimeDisplay(booking.startTime, booking.endTime)}
                </span>
              )}
              <span>•</span>
              <span>{booking.numberOfPeople} pers.</span>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1">
          {isPending && hasFullPermissions && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => booking._id && onConfirm(booking._id)}
                disabled={isConfirming}
              >
                <Check className="h-3 w-3 mr-1" />
                Valider
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onEdit(booking)}
                disabled={isCancelling}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => booking._id && handleCancelClick(booking._id)}
                disabled={isCancelling}
              >
                <X className="h-3 w-3 mr-1" />
                Refuser
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => booking._id && onDelete(booking._id)}
                  disabled={isDeleting}
                  title="Supprimer"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </>
          )}

          {!isPending && (
            <>
              {/* Only show Present/No-show buttons for client bookings (with card hold) */}
              {!booking.isAdminBooking && (
                <>
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
                </>
              )}
              {hasFullPermissions && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => onEdit(booking)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => booking._id && onDelete(booking._id)}
                      disabled={isDeleting}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Réservations - {formattedDate}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {visibleBookings.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune réservation pour ce jour</p>
                <Button onClick={onCreate} className="mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle réservation
                </Button>
              </div>
            ) : (
              <>
                {/* Pending bookings section */}
                {hasFullPermissions && pendingBookings.length > 0 && (
                  <Card className="border-orange-200">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border-b border-orange-200">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <h3 className="text-sm font-semibold text-orange-700">
                          En attente ({pendingBookings.length})
                        </h3>
                      </div>
                      <div>
                        {pendingBookings.map((booking) =>
                          renderBookingCard(booking, true),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Confirmed bookings section */}
                {confirmedBookings.length > 0 && (
                  <Card className="border-green-300">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 border-b rounded-t-2xl border-green-300">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <h3 className="text-sm font-semibold text-green-700">
                          Confirmées ({confirmedBookings.length})
                        </h3>
                      </div>
                      <div>
                        {confirmedBookings.map((booking) =>
                          renderBookingCard(booking, false),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Button to add new booking */}
                {hasFullPermissions && (
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={onCreate}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une réservation
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel dialog with reason */}
      <Dialog open={cancelDialogOpen} onOpenChange={handleCancelDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser la réservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Cette raison sera transmise au client par email.
            </p>
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-sm font-medium">
                Raison
              </label>
              <textarea
                id="cancelReason"
                placeholder="Indiquez la raison de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelDialogClose}>
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isCancelling}
            >
              {isCancelling ? "En cours..." : "Confirmer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
