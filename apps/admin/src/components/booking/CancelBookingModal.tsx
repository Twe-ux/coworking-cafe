"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { Booking } from "@/types/booking";

interface CancelBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

interface CancellationPreview {
  daysUntilBooking: number;
  chargePercentage: number;
  cancellationFee: number;
  refundAmount: number;
  message: string;
  isPending?: boolean;
  depositAmount?: number;
  businessDays?: boolean;
}

export function CancelBookingModal({
  booking,
  open,
  onOpenChange,
  onCancelled,
}: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Load cancellation preview when modal opens
  useEffect(() => {
    if (open && booking) {
      loadCancellationPreview();
    } else {
      // Reset state when modal closes
      setPreview(null);
      setError(null);
      setSuccess(null);
      setCancelReason("");
    }
  }, [open, booking]);

  const loadCancellationPreview = async () => {
    if (!booking?._id) return;

    setLoadingPreview(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/booking/reservations/${booking._id}/calculate-cancellation-fees`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Impossible de calculer les frais");
      }

      setPreview(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du calcul des frais"
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCancel = async () => {
    if (!booking?._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/booking/reservations/${booking._id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: cancelReason || "Annulée par l'administrateur",
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Échec de l'annulation");
      }

      setSuccess(data.message || "Réservation annulée avec succès");

      // Wait 3 seconds then close and refresh
      setTimeout(() => {
        if (onCancelled) {
          onCancelled();
        }
        onOpenChange(false);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  // Parse date safely (handle both string and Date objects)
  const bookingDate = typeof booking.startDate === 'string'
    ? new Date(booking.startDate)
    : new Date(booking.startDate);

  const formattedDate = bookingDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Annuler la réservation
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Les frais d'annulation seront
            appliqués selon la politique en vigueur.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50 text-green-900">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!success && (
          <>
            {/* Booking Details */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <h4 className="text-sm font-semibold">Détails de la réservation</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Espace :</span>
                  <span className="font-medium">{booking.spaceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date :</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
                {booking.startTime && booking.endTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horaire :</span>
                    <span className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant :</span>
                  <span className="font-medium">
                    {booking.totalPrice.toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>

            {/* Raison de l'annulation */}
            <div className="space-y-2">
              <Label htmlFor="cancelReason">
                Raison de l'annulation (optionnel)
              </Label>
              <Textarea
                id="cancelReason"
                placeholder="Ex: Annulation à la demande du client, indisponibilité, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Cette raison sera envoyée par email au client et visible dans l'historique.
              </p>
            </div>

            {/* Cancellation Preview */}
            {loadingPreview && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Calcul des frais d'annulation...</p>
              </div>
            )}

            {preview && !loadingPreview && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Conditions d'annulation</h4>
                <div
                  className={`rounded-lg border-l-4 p-4 ${
                    preview.chargePercentage === 0
                      ? "border-green-500 bg-green-50"
                      : preview.chargePercentage === 100
                      ? "border-red-500 bg-red-50"
                      : "border-orange-500 bg-orange-50"
                  }`}
                >
                  {booking.status === "pending" ? (
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Aucun frais</span>
                      </p>
                      <p
                        className="text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: preview.message }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Empreinte bancaire :
                          </span>
                          <span className="font-medium">
                            {preview.depositAmount?.toFixed(2) ||
                              booking.totalPrice.toFixed(2)}
                            €
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {preview.businessDays ? "Jours ouvrés" : "Jours"} restants :
                          </span>
                          <span className="font-medium">
                            {preview.daysUntilBooking} jour
                            {preview.daysUntilBooking > 1 ? "s" : ""}
                          </span>
                        </div>
                        {preview.cancellationFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Montant prélevé :
                            </span>
                            <span className="font-semibold text-destructive">
                              {preview.cancellationFee.toFixed(2)}€ (
                              {preview.chargePercentage}%)
                            </span>
                          </div>
                        )}
                        {preview.refundAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Montant non prélevé :
                            </span>
                            <span className="font-semibold text-green-700">
                              {preview.refundAmount.toFixed(2)}€
                            </span>
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-3 pt-3 border-t text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: preview.message }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {!success ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading || loadingPreview || !preview}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Annulation en cours...
                  </>
                ) : (
                  "Confirmer l'annulation"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
