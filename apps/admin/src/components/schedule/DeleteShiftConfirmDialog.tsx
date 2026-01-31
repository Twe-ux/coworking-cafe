"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface DeleteShiftConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  shiftInfo?: {
    employeeName: string;
    date: string;
    time: string;
  };
}

const STORAGE_KEY = "hideDeleteShiftConfirm";

export function DeleteShiftConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  shiftInfo,
}: DeleteShiftConfirmDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check if user previously selected "don't show again"
  useEffect(() => {
    const savedPreference = localStorage.getItem(STORAGE_KEY);
    if (savedPreference === "true" && open) {
      // Auto-confirm if user disabled the dialog
      onConfirm();
      onOpenChange(false);
    }
  }, [open, onConfirm, onOpenChange]);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    setDontShowAgain(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-left">
              Supprimer ce créneau ?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3 text-left">
            {shiftInfo ? (
              <div className="space-y-2">
                <p>Vous êtes sur le point de supprimer le créneau de :</p>
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium text-foreground">
                    {shiftInfo.employeeName}
                  </p>
                  <p className="text-muted-foreground">
                    {shiftInfo.date} • {shiftInfo.time}
                  </p>
                </div>
                <p className="text-destructive font-medium">
                  Cette action est irréversible.
                </p>
              </div>
            ) : (
              <p>
                Cette action est irréversible. Le créneau sera définitivement
                supprimé.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 py-3">
          <Checkbox
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <Label
            htmlFor="dont-show"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Ne plus afficher cette confirmation
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
