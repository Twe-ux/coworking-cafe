"use client";

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
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  action: "present" | "noshow";
  isProcessing?: boolean;
  isAdminBooking?: boolean;
}

/**
 * Dialog de confirmation pour les actions Présent/No-show
 * Remplace les window.confirm() par un composant stylé
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  action,
  isProcessing = false,
  isAdminBooking = false,
}: ConfirmActionDialogProps) {
  const config = {
    present: {
      icon: CheckCircle2,
      iconColor: "text-green-600",
      title: "Confirmer la présence du client",
      description: isAdminBooking
        ? "Le statut de la réservation sera mis à jour et un email de confirmation sera envoyé au client."
        : "Cela libérera l'empreinte bancaire et enverra un email de confirmation au client.",
      actionLabel: "Confirmer la présence",
      actionClass: "bg-green-600 hover:bg-green-700",
    },
    noshow: {
      icon: XCircle,
      iconColor: "text-orange-600",
      title: "Marquer comme no-show",
      description: isAdminBooking
        ? "Le statut de la réservation sera mis à jour et un email d'information sera envoyé au client."
        : "Cela capturera l'empreinte bancaire et enverra un email d'information au client.",
      actionLabel: "Marquer comme no-show",
      actionClass: "bg-orange-600 hover:bg-orange-700",
    },
  }[action];

  const Icon = config.icon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
            <AlertDialogTitle>{config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className={config.actionClass}
          >
            {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {config.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
