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
import { Checkbox } from "@/components/ui/checkbox";
import type { Booking } from "@/types/booking";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
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

interface CancellationFees {
  depositAmount: number;
  daysUntilBooking: number;
  chargePercentage: number;
  cancellationFee: number;
  refundAmount: number;
  cancellationMessage: string;
  isPending: boolean;
  hasPaymentIntent: boolean;
}

interface ReservationDetailModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (bookingId: string) => void;
  onCancel: (bookingId: string, reason: string, skipCapture?: boolean) => void;
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
  const [skipCapture, setSkipCapture] = useState(false);
  const [cancellationFees, setCancellationFees] =
    useState<CancellationFees | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);

  // Calculate cancellation fees when cancel dialog opens
  useEffect(() => {
    if (showCancelDialog && booking?._id && booking?.status === "confirmed") {
      console.log(
        "[ReservationDetailModal] Fetching cancellation fees for booking:",
        booking._id,
      );
      setLoadingFees(true);
      fetch(
        `/api/booking/reservations/${booking._id}/calculate-cancellation-fees`,
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(
            "[ReservationDetailModal] Cancellation fees response:",
            data,
          );
          if (data.success && data.data) {
            setCancellationFees(data.data);
          }
        })
        .catch((error) => {
          console.error(
            "[ReservationDetailModal] Error calculating fees:",
            error,
          );
        })
        .finally(() => {
          setLoadingFees(false);
        });
    }
  }, [showCancelDialog, booking?._id, booking?.status]);

  if (!booking) return null;

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    if (booking._id) {
      onCancel(
        booking._id,
        cancelReason || "Annulée par l'administrateur",
        skipCapture,
      );
      setShowCancelDialog(false);
      setCancelReason("");
      setSkipCapture(false);
      setCancellationFees(null);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelDialog(false);
    setCancelReason("");
    setSkipCapture(false);
    setCancellationFees(null);
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
                      booking.reservationType,
                    ),
                  )}
                >
                  {getReservationTypeLabel(
                    getCalculatedReservationType(
                      booking.startTime,
                      booking.endTime,
                      booking.reservationType,
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
                    disabled={isConfirming || isCancelling}
                  >
                    {isConfirming ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    {isConfirming ? "Validation..." : "Valider"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={handleCancelClick}
                    disabled={isConfirming || isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-1" />
                    )}
                    {isCancelling ? "Refus..." : "Refuser"}
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
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  {isCancelling ? "Annulation..." : "Annuler"}
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
            {/* Affichage des frais d'annulation pour réservations confirmées */}
            {booking.status === "confirmed" &&
              cancellationFees &&
              !loadingFees && (
                <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-orange-900">
                        {cancellationFees.cancellationMessage}
                      </p>
                      <div className="space-y-1 text-sm text-orange-800">
                        <div className="flex justify-between">
                          <span>Jours avant réservation :</span>
                          <span className="font-medium">
                            {cancellationFees.daysUntilBooking} jours
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Empreinte bancaire :</span>
                          <span className="font-medium">
                            {formatPrice(cancellationFees.depositAmount)}
                          </span>
                        </div>
                        {!skipCapture && (
                          <>
                            <div className="flex justify-between border-t border-orange-300 pt-1 mt-1">
                              <span>
                                Frais d'annulation (
                                {cancellationFees.chargePercentage}%) :
                              </span>
                              <span className="font-bold text-red-600">
                                {formatPrice(cancellationFees.cancellationFee)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Montant libéré :</span>
                              <span className="font-medium text-green-600">
                                {formatPrice(cancellationFees.refundAmount)}
                              </span>
                            </div>
                          </>
                        )}
                        {skipCapture && (
                          <div className="flex justify-between border-t border-orange-300 pt-1 mt-1">
                            <span>Montant libéré :</span>
                            <span className="font-bold text-green-600">
                              {formatPrice(cancellationFees.depositAmount)}{" "}
                              (100%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Loading state */}
            {booking.status === "confirmed" && loadingFees && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Calcul des frais en cours...
                </p>
              </div>
            )}

            {/* Checkbox pour ne pas capturer */}
            {booking.status === "confirmed" &&
              cancellationFees &&
              !cancellationFees.isPending && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Checkbox
                    id="skipCapture"
                    checked={skipCapture}
                    onCheckedChange={(checked) =>
                      setSkipCapture(checked === true)
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="skipCapture"
                      className="text-sm font-medium text-blue-900 cursor-pointer"
                    >
                      Ne pas capturer l'empreinte bancaire
                    </label>
                    <p className="text-xs text-blue-700 mt-1">
                      Libérer l'intégralité de l'empreinte malgré les frais
                      d'annulation
                    </p>
                  </div>
                </div>
              )}

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
            <Button variant="outline" onClick={handleCancelDialogClose} disabled={isCancelling}>
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isCancelling ? "Annulation..." : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
