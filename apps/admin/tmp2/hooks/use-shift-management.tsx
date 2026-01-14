"use client";

import { useEffect, useState } from "react";

// Types pour la gestion des shifts
export type ShiftData = {
  firstShift: { start: string; end: string };
  secondShift: { start: string; end: string };
  _id?: string;
};

export type ShiftStatus = "first" | "second" | null;

// Hook pour la gestion des shifts
export function useShiftManagement(staffId: string, form: any) {
  const [currentShiftData, setCurrentShiftData] = useState<ShiftData | null>(
    null,
  );
  const [activeShift, setActiveShift] = useState<ShiftStatus>(null);
  const [isFirstShiftActive, setIsFirstShiftActive] = useState(false);
  const [isSecondShiftActive, setIsSecondShiftActive] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [firstShiftElapsed, setFirstShiftElapsed] = useState("");
  const [secondShiftElapsed, setSecondShiftElapsed] = useState("");

  // Fonction pour formater le temps
  const formatTime = (isoString: string): string => {
    if (!isoString || isoString === "00:00" || isNaN(Date.parse(isoString))) {
      return "00:00";
    }
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Fonction pour calculer le temps écoulé
  const calculateElapsedTime = (
    startTime: string,
    endTime?: string,
  ): string => {
    if (!startTime || startTime === "00:00") return "";

    const now = new Date();
    const start = new Date(startTime);
    const end = endTime && endTime !== "00:00" ? new Date(endTime) : now;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes.toString().padStart(2, "0")}m`;
  };

  // Récupérer les données de shift
  const fetchShiftData = async () => {
    try {
      const response = await fetch(
        `/api/shift/get-by-staff-and-date?staffId=${staffId}&date=${form.date}`,
      );
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCurrentShiftData(result.data);
          // Déterminer l'état actuel des shifts
          updateShiftStates(result.data);
        } else {
          resetShiftData();
        }
      } else {
        resetShiftData();
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des shifts:", error);
      resetShiftData();
    }
  };

  // Réinitialiser les données de shift
  const resetShiftData = () => {
    setCurrentShiftData({
      firstShift: { start: "00:00", end: "00:00" },
      secondShift: { start: "00:00", end: "00:00" },
    });
    setActiveShift(null);
    setIsFirstShiftActive(false);
    setIsSecondShiftActive(false);
    setIsBlocked(false);
  };

  // Mettre à jour les états des shifts
  const updateShiftStates = (data: ShiftData) => {
    const firstStarted = data.firstShift.start !== "00:00";
    const firstEnded = data.firstShift.end !== "00:00";
    const secondStarted = data.secondShift.start !== "00:00";
    const secondEnded = data.secondShift.end !== "00:00";

    setIsFirstShiftActive(firstStarted && !firstEnded);
    setIsSecondShiftActive(secondStarted && !secondEnded);

    if (firstStarted && !firstEnded) {
      setActiveShift("first");
    } else if (secondStarted && !secondEnded) {
      setActiveShift("second");
    } else {
      setActiveShift(null);
    }

    // Un shift est bloqué si le premier n'est pas terminé et qu'on essaie de commencer le second
    setIsBlocked(firstStarted && !firstEnded && secondStarted);
  };

  // Démarrer un shift
  const startShift = async (shiftType: "first" | "second") => {
    try {
      const response = await fetch("/api/shift/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          date: form.date,
          shiftType,
        }),
      });

      if (response.ok) {
        await fetchShiftData();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  // Terminer un shift
  const endShift = async (shiftType: "first" | "second") => {
    try {
      const response = await fetch("/api/shift/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          date: form.date,
          shiftType,
        }),
      });

      if (response.ok) {
        await fetchShiftData();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  // Effect pour le changement de date à minuit
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = new Date().toISOString().slice(0, 10);
      if (currentDate !== form.date) {
        resetShiftData();
      }
    };

    checkDateChange();
    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [form.date]);

  // Effect pour les minuteurs en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentShiftData) {
        if (
          isFirstShiftActive &&
          currentShiftData.firstShift.start !== "00:00"
        ) {
          setFirstShiftElapsed(
            calculateElapsedTime(
              currentShiftData.firstShift.start,
              currentShiftData.firstShift.end !== "00:00"
                ? currentShiftData.firstShift.end
                : undefined,
            ),
          );
        }
        if (
          isSecondShiftActive &&
          currentShiftData.secondShift.start !== "00:00"
        ) {
          setSecondShiftElapsed(
            calculateElapsedTime(
              currentShiftData.secondShift.start,
              currentShiftData.secondShift.end !== "00:00"
                ? currentShiftData.secondShift.end
                : undefined,
            ),
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentShiftData, isFirstShiftActive, isSecondShiftActive]);

  // Charger les données au montage et quand la date change
  useEffect(() => {
    fetchShiftData();
  }, [staffId, form.date]);

  return {
    currentShiftData,
    activeShift,
    isFirstShiftActive,
    isSecondShiftActive,
    isBlocked,
    firstShiftElapsed,
    secondShiftElapsed,
    formatTime,
    calculateElapsedTime,
    startShift,
    endShift,
    fetchShiftData,
  };
}
