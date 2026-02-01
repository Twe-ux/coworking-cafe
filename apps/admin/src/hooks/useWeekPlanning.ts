import { useState, useEffect, useCallback } from "react";
import type { Shift } from "@/types/shift";

/**
 * Hook pour récupérer les shifts de la semaine en cours
 * Logique séparée du composant pour respecter limite 100 lignes
 */
export function useWeekPlanning() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcule la date de début et fin de la semaine en cours
   * Format: YYYY-MM-DD
   * Utilise Europe/Paris timezone pour Vercel
   */
  const getWeekDates = useCallback(() => {
    // Obtenir la date actuelle en timezone Paris
    const now = new Date();
    const parisDateStr = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    // Convertir DD/MM/YYYY → Date object
    const [day, month, year] = parisDateStr.split('/').map(Number);
    const parisDate = new Date(year, month - 1, day);

    const dayOfWeek = parisDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.

    // Calculer le lundi de la semaine (début)
    const monday = new Date(parisDate);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, remonter de 6 jours
    monday.setDate(parisDate.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Calculer le dimanche de la semaine (fin)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Format YYYY-MM-DD
    const startDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const endDate = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

    return { startDate, endDate, monday, sunday };
  }, []);

  const fetchWeekShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getWeekDates();

      const params = new URLSearchParams({
        startDate,
        endDate,
        active: "true",
      });

      const response = await fetch(`/api/shifts?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la récupération des shifts");
      }

      setShifts(result.data || []);
    } catch (err) {
      console.error("Error fetching week shifts:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [getWeekDates]);

  useEffect(() => {
    fetchWeekShifts();
  }, [fetchWeekShifts]);

  return {
    shifts,
    isLoading,
    error,
    refetch: fetchWeekShifts,
    weekDates: getWeekDates(),
  };
}
