"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface JustificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (justification: string) => void;
  isLoading?: boolean;
  action: "clock-in" | "clock-out";
  clockTime?: string;
  scheduledShifts?: Array<{ startTime: string; endTime: string }>;
}

/**
 * Modal de justification pour pointages hors planning
 * Affiché quand un employé pointe en dehors des horaires (±15min)
 */
export function JustificationDialog({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  action,
  clockTime,
  scheduledShifts = [],
}: JustificationDialogProps) {
  const [justification, setJustification] = useState("");

  const handleSubmit = () => {
    if (justification.trim()) {
      onSubmit(justification.trim());
      setJustification(""); // Reset après soumission
    }
  };

  const handleCancel = () => {
    setJustification("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-100 p-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <DialogTitle>Pointage hors planning</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Vous pointez en dehors de vos horaires planifiés (±15min).
            <br />
            Veuillez justifier ce pointage pour continuer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Infos sur le pointage */}
          {clockTime && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">
                {action === "clock-in" ? "Heure d'arrivée" : "Heure de départ"} :{" "}
                <span className="text-orange-600">{clockTime}</span>
              </p>
              {scheduledShifts.length > 0 && (
                <div className="mt-2">
                  <p className="text-muted-foreground">Horaires planifiés :</p>
                  <ul className="mt-1 space-y-1">
                    {scheduledShifts.map((shift, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {shift.startTime} - {shift.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Champ de justification */}
          <div className="space-y-2">
            <label
              htmlFor="justification"
              className="text-sm font-medium leading-none"
            >
              Justification <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="justification"
              placeholder="Expliquez pourquoi vous pointez en dehors de vos horaires..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {justification.length}/500 caractères
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !justification.trim()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? "Envoi..." : "Valider le pointage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
