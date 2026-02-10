import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { formatPrice } from "../utils";

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

interface QuickCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: (skipCapture: boolean) => void;
  isCancelling: boolean;
  bookingId: string | null;
  bookingStatus?: string;
}

export function QuickCancelDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onConfirm,
  isCancelling,
  bookingId,
  bookingStatus,
}: QuickCancelDialogProps) {
  const [skipCapture, setSkipCapture] = useState(false);
  const [cancellationFees, setCancellationFees] = useState<CancellationFees | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);

  // Calculate cancellation fees when dialog opens
  useEffect(() => {
    if (open && bookingId && bookingStatus === "confirmed") {
      console.log('[QuickCancelDialog] Fetching cancellation fees for booking:', bookingId);
      setLoadingFees(true);
      fetch(`/api/booking/reservations/${bookingId}/calculate-cancellation-fees`)
        .then((res) => res.json())
        .then((data) => {
          console.log('[QuickCancelDialog] Cancellation fees response:', data);
          if (data.success && data.data) {
            setCancellationFees(data.data);
          }
        })
        .catch((error) => {
          console.error("[QuickCancelDialog] Error calculating fees:", error);
        })
        .finally(() => {
          setLoadingFees(false);
        });
    }

    // Reset when dialog closes
    if (!open) {
      setCancellationFees(null);
      setSkipCapture(false);
    }
  }, [open, bookingId, bookingStatus]);

  const handleConfirm = () => {
    onConfirm(skipCapture);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Annuler la réservation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Affichage des frais d'annulation pour réservations confirmées */}
          {bookingStatus === "confirmed" && cancellationFees && !loadingFees && (
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
                      <span className="font-medium">{cancellationFees.daysUntilBooking} jours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Empreinte bancaire :</span>
                      <span className="font-medium">{formatPrice(cancellationFees.depositAmount)}</span>
                    </div>
                    {!skipCapture && (
                      <>
                        <div className="flex justify-between border-t border-orange-300 pt-1 mt-1">
                          <span>Frais d'annulation ({cancellationFees.chargePercentage}%) :</span>
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
                          {formatPrice(cancellationFees.depositAmount)} (100%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {bookingStatus === "confirmed" && loadingFees && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Calcul des frais en cours...</p>
            </div>
          )}

          {/* Checkbox pour ne pas capturer */}
          {bookingStatus === "confirmed" && cancellationFees && !cancellationFees.isPending && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Checkbox
                id="skipCapture"
                checked={skipCapture}
                onCheckedChange={(checked) => setSkipCapture(checked === true)}
              />
              <div className="flex-1">
                <label
                  htmlFor="skipCapture"
                  className="text-sm font-medium text-blue-900 cursor-pointer"
                >
                  Ne pas capturer l'empreinte bancaire
                </label>
                <p className="text-xs text-blue-700 mt-1">
                  Libérer l'intégralité de l'empreinte malgré les frais d'annulation
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancelReason">
              Raison de l'annulation (optionnel)
            </Label>
            <Textarea
              id="cancelReason"
              placeholder="Ex: Indisponibilité de l'espace, demande du client..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isCancelling}
          >
            {isCancelling ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
