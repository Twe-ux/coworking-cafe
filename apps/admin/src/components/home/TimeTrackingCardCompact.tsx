"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Employee } from "@/types/hr";
import type { TimeEntry } from "@/types/timeEntry";
import { Play, Square } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PINKeypad from "@/components/clocking/PINKeypad";

interface TimeTrackingCardCompactProps {
  employee: Employee;
  onStatusChange?: () => void;
}

/**
 * Version compacte de TimeTrackingCard pour la page d'accueil
 * Nom + prénom + bouton Start/Stop (sans chrono)
 */
export function TimeTrackingCardCompact({
  employee,
  onStatusChange,
}: TimeTrackingCardCompactProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pinAction, setPinAction] = useState<"clock-in" | "clock-out" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  const fetchActiveEntry = useCallback(async () => {
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const timestamp = Date.now();
      const activeUrl = `/api/time-entries?employeeId=${employee.id}&status=active&limit=1&_t=${timestamp}`;
      const activeResponse = await fetch(activeUrl, { cache: "no-store" });

      if (activeResponse.status === 401 || !activeResponse.ok) {
        setActiveEntry(null);
        return;
      }

      const activeData = await activeResponse.json();
      const todayActiveEntry = (activeData.data || []).find(
        (entry: TimeEntry) => entry.date === todayStr
      );
      setActiveEntry(todayActiveEntry || null);
    } catch {
      // Silent fail
    }
  }, [employee.id]);

  useEffect(() => {
    fetchActiveEntry();
  }, [fetchActiveEntry]);

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
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/time-entries/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id }),
      });

      const result = await response.json();

      if (result.success) {
        setTimeout(async () => {
          await fetchActiveEntry();
          onStatusChange?.();
        }, 300);
      } else {
        setError(result.error || "Erreur lors de l'arrêt du pointage");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINSubmit = async (pin: string) => {
    if (!pinAction) return;

    setIsLoading(true);
    setError(null);

    try {
      const pinResponse = await fetch("/api/hr/employees/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, pin }),
      });

      const pinResult = await pinResponse.json();

      if (!pinResult.success) {
        setError("Code PIN incorrect");
        setIsLoading(false);
        return;
      }

      const endpoint = `/api/time-entries/${pinAction}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id, pin }),
      });

      const result = await response.json();

      if (result.success) {
        setShowPINDialog(false);
        setPinAction(null);

        setTimeout(async () => {
          await fetchActiveEntry();
          onStatusChange?.();
        }, 300);
      } else {
        setError(result.error || "Erreur lors du pointage");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePINCancel = () => {
    setShowPINDialog(false);
    setPinAction(null);
    setError(null);
  };

  const hasActiveShift = !!activeEntry;

  return (
    <>
      <Card
        className={`p-3 transition-all duration-200 ${
          hasActiveShift
            ? "bg-green-50 ring-2 ring-green-500"
            : "hover:ring-2 hover:ring-blue-500"
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
              <Square className="h-3 w-3 mr-1" />
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
              <Play className="h-3 w-3 mr-1" />
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
    </>
  );
}
