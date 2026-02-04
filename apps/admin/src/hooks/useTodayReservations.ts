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
  const userRole = (session?.user as { role?: string })?.role || "staff";
  const isAdminOrDev = isAuthenticated && ["admin", "dev"].includes(userRole);

  const fetchTodayReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = getTodayParis();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

      const params = new URLSearchParams({
        startDate: today,
        endDate: tomorrowStr, // Fetch today + tomorrow
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

      const data = result.data || [];

      // Add cache to sessionStorage
      try {
        sessionStorage.setItem("todayReservations", JSON.stringify(data));
        sessionStorage.setItem("todayReservationsTimestamp", Date.now().toString());
      } catch (e) {
        // Ignore storage errors
      }

      setReservations(data);
    } catch (err) {
      console.error("Error fetching today reservations:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");

      // Try to load from cache on error
      try {
        const cached = sessionStorage.getItem("todayReservations");
        if (cached) {
          setReservations(JSON.parse(cached));
        }
      } catch (e) {
        // Ignore cache read errors
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdminOrDev]);

  useEffect(() => {
    // Load from cache first (if exists and recent)
    try {
      const cached = sessionStorage.getItem("todayReservations");
      const timestamp = sessionStorage.getItem("todayReservationsTimestamp");

      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        // Cache valid for 5 minutes
        if (age < 5 * 60 * 1000) {
          setReservations(JSON.parse(cached));
          setIsLoading(false);
        }
      }
    } catch (e) {
      // Ignore cache read errors
    }

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
