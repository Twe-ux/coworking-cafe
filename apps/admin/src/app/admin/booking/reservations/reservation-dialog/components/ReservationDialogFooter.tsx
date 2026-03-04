"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface ReservationDialogFooterProps {
  sendEmail: boolean;
  onSendEmailChange: (checked: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isValid: boolean;
  submitting: boolean;
}

export function ReservationDialogFooter({
  sendEmail,
  onSendEmailChange,
  onCancel,
  onSubmit,
  isValid,
  submitting,
}: ReservationDialogFooterProps) {
  return (
    <DialogFooter>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="sendEmail"
          checked={sendEmail}
          onChange={(e) => onSendEmailChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label htmlFor="sendEmail" className="text-sm">
          Envoyer un email au client
        </label>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
          onClick={onCancel}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={onSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? "Création..." : "Valider la réservation"}
        </Button>
      </div>
    </DialogFooter>
  );
}
