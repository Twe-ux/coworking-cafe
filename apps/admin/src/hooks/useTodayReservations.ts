import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Booking } from "@/types/booking";
import { getTodayParis } from "@/lib/utils/date";

/**
 * Hook pour récupérer les réservations du jour
 * Filtré selon le rôle de l'utilisateur :
 * - staff : seulement les réservations confirmées
 * - admin/dev : toutes les réservations
 *
 * Logique séparée du composant pour respecter limite 100 lignes
 */
export function useTodayReservations() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = session?.user?.role?.name || "staff";
  const isAdminOrDev = ["admin", "dev"].includes(userRole);

  const fetchTodayReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Date du jour (format YYYY-MM-DD) - timezone Paris pour Vercel
      const today = getTodayParis();

      // Construire les paramètres
      const params = new URLSearchParams({
        startDate: today,
        endDate: today,
      });

      // Si staff, filtrer seulement les confirmées
      if (!isAdminOrDev) {
        params.set("status", "confirmed");
      }

      const response = await fetch(`/api/booking/reservations?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la récupération des réservations"
        );
      }

      setReservations(result.data || []);
    } catch (err) {
      console.error("Error fetching today reservations:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [isAdminOrDev]);

  useEffect(() => {
    fetchTodayReservations();
  }, [fetchTodayReservations]);

  return {
    reservations,
    isLoading,
    error,
    refetch: fetchTodayReservations,
    isAdminOrDev,
  };
}
