"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Booking } from "@/types/booking";
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Mail,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  formatDate,
  formatPrice,
  formatTimeDisplay,
  getCalculatedReservationType,
  getReservationTypeBadgeClass,
  getReservationTypeLabel,
  getStatusBadgeClass,
  getStatusLabel,
} from "./utils";

interface ReservationDetailModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string, reason: string) => void;
  isConfirming?: boolean;
  isCancelling?: boolean;
}

export function ReservationDetailModal({
  booking,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isConfirming = false,
  isCancelling = false,
}: ReservationDetailModalProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!booking) return null;

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    if (booking._id) {
      onCancel(booking._id, cancelReason || "Annulée par l'administrateur");
      setShowCancelDialog(false);
      setCancelReason("");
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setCancelReason("");
  };

  // Format deposit amount (stored in cents)
  const formatDepositAmount = (amount: number | undefined): string | null => {
    if (amount === undefined || amount === null) return null;
    // If amount > 1000, it's probably in cents
    if (amount > 1000) {
      return formatPrice(amount / 100);
    }
    return formatPrice(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Espace */}
            <div>
              <h3 className="text-lg font-bold">{booking.spaceName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(booking.status)}
                >
                  {getStatusLabel(booking.status)}
                </Badge>
                <Badge
                  variant="outline"
                  className={getReservationTypeBadgeClass(
                    getCalculatedReservationType(
                      booking.startTime,
                      booking.endTime,
                    ),
                  )}
                >
                  {getReservationTypeLabel(
                    getCalculatedReservationType(
                      booking.startTime,
                      booking.endTime,
                    ),
                  )}
                </Badge>
              </div>
            </div>

            {/* Client */}

            <div className="flex gap-20 px-4">
              <div className="flex flex-col gap-2 text-sm space-y-4">
                <h4 className="font-semibold text-blue-600">
                  {booking.clientName || "Client"}
                </h4>
                <div className="space-y-2">
                  {booking.clientEmail && (
                    <a
                      href={`mailto:${booking.clientEmail}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="underline">{booking.clientEmail}</span>
                    </a>
                  )}
                  {booking.clientPhone && (
                    <a
                      href={`tel:${booking.clientPhone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="underline">{booking.clientPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Date, heure, personnes */}
              <div className="flex flex-col gap-3 text-sm justify-end">
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(booking.startDate)}
                    {booking.startDate !== booking.endDate &&
                      ` → ${formatDate(booking.endDate)}`}
                  </span>
                </div>
                {booking.startTime && (
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatTimeDisplay(booking.startTime, booking.endTime)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.numberOfPeople} pers.</span>
                </div>
              </div>
            </div>
            {/* Paiement */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
              {booking.depositPaid !== undefined && booking.depositPaid > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-green-600">
                    <CreditCard className="h-4 w-4" />
                    Acompte versé
                  </span>
                  <span className="text-green-600 font-medium">
                    {formatPrice(booking.depositPaid)}
                  </span>
                </div>
              )}
              {(booking.captureMethod === "manual" ||
                booking.captureMethod === "deferred") && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-blue-600">
                    <CreditCard className="h-4 w-4" />
                    Empreinte CB
                  </span>
                  <span className="text-blue-600 font-medium">
                    {formatDepositAmount(booking.depositAmount) || "Non défini"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              {booking.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => booking._id && onConfirm(booking._id)}
                    disabled={isConfirming}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={handleCancelClick}
                    disabled={isCancelling}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Refuser
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={handleCancelClick}
                  disabled={isCancelling}
                >
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation avec raison */}
      <Dialog open={showCancelDialog} onOpenChange={handleCancelDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {booking.status === "pending"
                ? "Refuser la réservation"
                : "Annuler la réservation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Cette raison sera transmise au client par email.
            </p>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Raison</Label>
              <Textarea
                id="cancelReason"
                placeholder="Indiquez la raison de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
