"use client";

import PINKeypad from "@/components/clocking/PINKeypad";
import { JustificationDialog } from "@/components/clocking/JustificationDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Employee } from "@/types/hr";
import { Loader2, Play, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActiveTimeEntry } from "@/hooks/useActiveTimeEntry";

interface TimeTrackingCardCompactProps {
  employee: Employee;
  onStatusChange?: () => void;
}

/**
 * Version compacte de TimeTrackingCard pour la page d'accueil
 * Nom + prénom + bouton Start/Stop (sans chrono)
 *
 * Optimisations:
 * - React Query pour cache partagé et auto-refresh
 * - Optimistic updates pour feedback instantané
 * - Timeout 10s sur toutes les requêtes
 * - Délai réduit à 100ms (vs 300ms)
 */
export function TimeTrackingCardCompact({
  employee,
  onStatusChange,
}: TimeTrackingCardCompactProps) {
  const {
    activeEntry,
    isLoading: isQueryLoading,
    refetch,
    clockIn,
    clockOut,
    isClockingIn,
    isClockingOut,
  } = useActiveTimeEntry(employee.id);

  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pinAction, setPinAction] = useState<"clock-in" | "clock-out" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // État pour le modal de justification
  const [showJustificationDialog, setShowJustificationDialog] = useState(false);
  const [justificationData, setJustificationData] = useState<{
    action: "clock-in" | "clock-out";
    pin: string;
    clockTime?: string;
    scheduledShifts?: Array<{ startTime: string; endTime: string }>;
  } | null>(null);

  const isLoading = isQueryLoading || isClockingIn || isClockingOut;

  const handleClockAction = (action: "clock-in" | "clock-out") => {
    if (action === "clock-out") {
      handleDirectClockOut();
    } else {
      setPinAction(action);
      setShowPINDialog(true);
      setError(null);
    }
  };

  const handleDirectClockOut = async () => {
    toast.loading("Arrêt du pointage en cours...", { id: "clock-out" });

    try {
      // Call API directly to handle JUSTIFICATION_REQUIRED properly
      const response = await fetch("/api/time-entries/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id }),
        signal: AbortSignal.timeout(10000),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Pointage arrêté avec succès", { id: "clock-out" });

        // Invalidate cache to refresh data
        setTimeout(() => {
          refetch();
          onStatusChange?.();
        }, 100);
      } else {
        // Check if it's a justification required error
        if (
          result.details &&
          typeof result.details === "object" &&
          "code" in result.details &&
          result.details.code === "JUSTIFICATION_REQUIRED"
        ) {
          toast.dismiss("clock-out");

          // Show justification dialog
          setJustificationData({
            action: "clock-out",
            pin: "",
            clockTime: result.details.clockOutTime,
            scheduledShifts: result.details.scheduledShifts || [],
          });
          setShowJustificationDialog(true);
        } else {
          toast.error(result.error || "Erreur lors de l'arrêt du pointage", {
            id: "clock-out",
          });
        }
      }
    } catch (error: any) {
      toast.error("Erreur de connexion", { id: "clock-out" });
    }
  };

  const handlePINSubmit = async (pin: string) => {
    if (!pinAction) return;

    setError(null);
    toast.loading("Vérification du code PIN...", { id: "clock-action" });

    try {
      // Verify PIN first
      const pinResponse = await fetch("/api/hr/employees/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, pin }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      const pinResult = await pinResponse.json();

      if (!pinResult.success) {
        setError("Code PIN incorrect");
        toast.error("Code PIN incorrect", { id: "clock-action" });
        return;
      }

      // PIN verified, proceed with clock action
      toast.loading(
        pinAction === "clock-in"
          ? "Démarrage du pointage..."
          : "Arrêt du pointage...",
        { id: "clock-action" },
      );

      // ⚠️ IMPORTANT: Call API directly instead of using hook
      // to properly handle JUSTIFICATION_REQUIRED with all details
      const endpoint = `/api/time-entries/${pinAction}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, pin }),
        signal: AbortSignal.timeout(10000),
      });

      const result = await response.json();

      if (result.success) {
        // Success
        toast.success(
          pinAction === "clock-in"
            ? "Pointage démarré avec succès"
            : "Pointage arrêté avec succès",
          { id: "clock-action" },
        );

        setShowPINDialog(false);
        setPinAction(null);

        // Invalidate React Query cache to refresh data
        setTimeout(() => {
          refetch();
          onStatusChange?.();
        }, 100);
      } else {
        // Check if it's a justification required error
        if (
          result.details &&
          typeof result.details === "object" &&
          "code" in result.details &&
          result.details.code === "JUSTIFICATION_REQUIRED"
        ) {
          // Show justification dialog
          setShowPINDialog(false);
          toast.dismiss("clock-action");

          setJustificationData({
            action: pinAction,
            pin,
            clockTime: result.details.clockInTime || result.details.clockOutTime,
            scheduledShifts: result.details.scheduledShifts || [],
          });
          setShowJustificationDialog(true);
        } else {
          // Other error
          setError(result.error || "Erreur lors du pointage");
          toast.error(result.error || "Erreur lors du pointage", {
            id: "clock-action",
          });
        }
      }
    } catch (error: any) {
      setError("Erreur de connexion");
      toast.error("Erreur de connexion", { id: "clock-action" });
    }
  };

  const handlePINCancel = () => {
    setShowPINDialog(false);
    setPinAction(null);
    setError(null);
  };

  const handleJustificationSubmit = async (justification: string) => {
    if (!justificationData) return;

    toast.loading("Enregistrement du pointage...", { id: "clock-justification" });

    try {
      const requestBody: {
        employeeId: string;
        justificationNote: string;
        pin?: string;
      } = {
        employeeId: employee.id,
        justificationNote: justification,
      };

      if (justificationData.pin) {
        requestBody.pin = justificationData.pin;
      }

      // Call API directly to handle success/error properly
      const endpoint = `/api/time-entries/${justificationData.action}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          justificationData.action === "clock-in"
            ? "Pointage démarré avec succès"
            : "Pointage arrêté avec succès",
          { id: "clock-justification" },
        );

        setShowJustificationDialog(false);
        setJustificationData(null);
        setPinAction(null);

        // Invalidate cache to refresh data
        setTimeout(() => {
          refetch();
          onStatusChange?.();
        }, 100);
      } else {
        toast.error(result.error || "Erreur lors du pointage", {
          id: "clock-justification",
        });
      }
    } catch (error: any) {
      toast.error("Erreur de connexion", { id: "clock-justification" });
    }
  };

  const handleJustificationCancel = () => {
    setShowJustificationDialog(false);
    setJustificationData(null);
    setPinAction(null);
  };

  const hasActiveShift = !!activeEntry;

  return (
    <>
      <Card
        className={`p-3 transition-all duration-200 ${
          hasActiveShift
            ? "bg-green-50 ring-1 ring-green-500"
            : "hover:ring-1 hover:ring-blue-500"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: employee.color || "#9CA3AF" }}
            />
            <span className="text-sm font-medium truncate">
              {employee.firstName} {employee.lastName}
            </span>
          </div>

          {hasActiveShift ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClockAction("clock-out");
              }}
              variant="destructive"
              className="h-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Square className="h-3 w-3 mr-1" />
              )}
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClockAction("clock-in");
              }}
              className="bg-green-600 hover:bg-green-700 h-8"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Pointer
            </Button>
          )}
        </div>
      </Card>

      <Dialog open={showPINDialog} onOpenChange={handlePINCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pinAction === "clock-in"
                ? "Commencer le pointage"
                : "Arrêter le pointage"}
            </DialogTitle>
          </DialogHeader>
          <PINKeypad
            onSubmit={handlePINSubmit}
            onCancel={handlePINCancel}
            isLoading={isLoading}
            error={error || undefined}
            employeeName={`${employee.firstName} ${employee.lastName}`}
          />
        </DialogContent>
      </Dialog>

      <JustificationDialog
        open={showJustificationDialog}
        onClose={handleJustificationCancel}
        onSubmit={handleJustificationSubmit}
        isLoading={isLoading}
        action={justificationData?.action || "clock-in"}
        clockTime={justificationData?.clockTime}
        scheduledShifts={justificationData?.scheduledShifts}
      />
    </>
  );
}
