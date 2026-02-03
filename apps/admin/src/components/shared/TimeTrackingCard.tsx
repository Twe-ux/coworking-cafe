"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type Employee } from "@/types/hr";
import type { TimeEntry } from "@/types/timeEntry";
import { Clock, Play, Square, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PINKeypad from "@/components/clocking/PINKeypad";
import { StyledAlert } from "@/components/ui/styled-alert";

interface TimeTrackingCardProps {
  employee: Employee;
  onStatusChange?: () => void;
  className?: string;
}

export default function TimeTrackingCard({
  employee,
  onStatusChange,
  className = "",
}: TimeTrackingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPINDialog, setShowPINDialog] = useState(false);
  const [pinAction, setPinAction] = useState<"clock-in" | "clock-out" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [activeEntries, setActiveEntries] = useState<TimeEntry[]>([]);
  const [totalTodayEntries, setTotalTodayEntries] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActiveEntries = useCallback(async () => {
    try {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Cache bust pour forcer le fetch des nouvelles données
      const timestamp = Date.now();
      const activeUrl = `/api/time-entries?employeeId=${employee.id}&status=active&limit=10&_t=${timestamp}`;
      const activeResponse = await fetch(activeUrl, { cache: "no-store" });

      // Si 401, ignorer silencieusement (mode staff public)
      if (activeResponse.status === 401) {
        setActiveEntries([]);
        setTotalTodayEntries(0);
        return;
      }

      if (activeResponse.ok) {
        const activeData = await activeResponse.json();
        const todayActiveEntries = (activeData.data || []).filter(
          (entry: TimeEntry) => entry.date === todayStr,
        );
        setActiveEntries(todayActiveEntries);
      }

      const allUrl = `/api/time-entries?employeeId=${employee.id}&limit=10&_t=${timestamp}`;
      const allResponse = await fetch(allUrl, { cache: "no-store" });

      // Si 401, ignorer silencieusement
      if (allResponse.status === 401) {
        return;
      }

      if (allResponse.ok) {
        const allData = await allResponse.json();
        const todayAllEntries = (allData.data || []).filter(
          (entry: TimeEntry) => entry.date === todayStr,
        );
        setTotalTodayEntries(todayAllEntries.length);
      }
    } catch (error) {
      console.error("Error fetching active entries:", error);
    }
  }, [employee.id]);

  useEffect(() => {
    fetchActiveEntries();
  }, [fetchActiveEntries]);

  const handleClockAction = (action: "clock-in" | "clock-out") => {
    // Si c'est un clock-out, pas besoin de PIN
    if (action === "clock-out") {
      handleDirectClockOut();
    } else {
      // Pour clock-in, demander le PIN
      setPinAction(action);
      setShowPINDialog(true);
      setError(null);
    }
  };

  const handleCardClick = () => {
    if (hasActiveShift) {
      handleClockAction("clock-out");
    } else if (canClockIn) {
      handleClockAction("clock-in");
    }
  };

  // Clock-out direct sans PIN
  const handleDirectClockOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `/api/time-entries/clock-out`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Petit délai pour laisser la BD se mettre à jour
        setTimeout(async () => {
          await fetchActiveEntries();
          onStatusChange?.();
        }, 300);
      } else {
        setError(result.error || "Erreur lors de l'arrêt du pointage");
      }
    } catch (error) {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
          pin,
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: employee.id,
          pin: pin,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowPINDialog(false);
        setPinAction(null);

        // Petit délai pour laisser la BD se mettre à jour
        setTimeout(async () => {
          await fetchActiveEntries();
          onStatusChange?.();
        }, 300);
      } else {
        setError(result.error || "Erreur lors du pointage");
      }
    } catch (error) {
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

  const formatElapsedTime = (clockInTime: string, date: string): string => {
    const [hours, minutes] = clockInTime.split(":").map(Number);
    const [year, month, day] = date.split("-").map(Number);

    const clockInDate = new Date(year, month - 1, day, hours, minutes, 0);

    const elapsed = Math.floor(
      (currentTime.getTime() - clockInDate.getTime()) / 1000,
    );
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canClockIn = totalTodayEntries < 2;
  const hasActiveShift = activeEntries.length > 0;

  return (
    <>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          hasActiveShift
            ? "bg-green-50 ring-2 ring-green-500"
            : canClockIn
              ? "hover:ring-2 hover:ring-blue-500"
              : "cursor-not-allowed opacity-75"
        } ${className}`}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: employee.color || "#9CA3AF" }}
            />
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base font-medium">
                {employee.firstName} {employee.lastName}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {totalTodayEntries}/2
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {activeEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-5"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-sm font-medium">
                  Shift {entry.shiftNumber}
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-green-700">
                  {formatElapsedTime(entry.clockIn, entry.date)}
                </div>
                <div className="text-xs text-gray-600">
                  Début: {entry.clockIn}
                </div>
              </div>
            </div>
          ))}

          {!hasActiveShift && (
            <div className="text-center text-gray-500">
              <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm">Aucun pointage actif</p>
              <p className="mt-1 text-xs text-gray-400">
                Cliquez pour commencer
              </p>
            </div>
          )}

          <div className="flex justify-center">
            {hasActiveShift ? (
              <Button
                className="flex w-full items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClockAction("clock-out");
                }}
                variant="destructive"
              >
                <Square className="h-4 w-4" />
                Arrêter le pointage
              </Button>
            ) : canClockIn ? (
              <Button
                className="flex w-full items-center justify-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClockAction("clock-in");
                }}
                variant="default"
              >
                <Play className="h-4 w-4" />
                Commencer le pointage
              </Button>
            ) : null}
          </div>

          {!canClockIn && (
            <StyledAlert variant="warning">
              Maximum 2 pointages par jour atteint
            </StyledAlert>
          )}
        </CardContent>
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
