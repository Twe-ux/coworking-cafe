import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Booking } from "@/types/booking";
import { getTodayParis } from "@/lib/utils/date";

/**
 * Hook pour récupérer les réservations du jour
 * - Sans session (page publique "/") : mode public, seulement confirmées
 * - staff : seulement les réservations confirmées
 * - admin/dev : toutes les réservations
 */
export function useTodayReservations() {
  const { data: session, status: sessionStatus } = useSession();
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = sessionStatus === "authenticated";
  const userRole = session?.user?.role?.name || "staff";
  const isAdminOrDev = isAuthenticated && ["admin", "dev"].includes(userRole);

  const fetchTodayReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = getTodayParis();

      const params = new URLSearchParams({
        startDate: today,
        endDate: today,
      });

      // No session: use public mode (confirmed only, no auth)
      if (!isAuthenticated) {
        params.set("public", "true");
      } else if (!isAdminOrDev) {
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
  }, [isAuthenticated, isAdminOrDev]);

  useEffect(() => {
    // Wait for session check to complete before fetching
    if (sessionStatus === "loading") return;
    fetchTodayReservations();
  }, [fetchTodayReservations, sessionStatus]);

  return {
    reservations,
    isLoading,
    error,
    refetch: fetchTodayReservations,
    isAdminOrDev,
  };
}
