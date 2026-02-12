import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Booking } from "@/types/booking";
import { getTodayParis } from "@/lib/utils/date";

interface ApiResponse {
  success: boolean;
  data?: Booking[];
  error?: string;
}

/**
 * Fetch today + tomorrow reservations from API
 */
async function fetchTodayReservations(
  today: string,
  isAuthenticated: boolean
): Promise<Booking[]> {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const params = new URLSearchParams({
    startDate: today,
    endDate: tomorrowStr,
    status: "confirmed",
  });

  if (!isAuthenticated) {
    params.set("public", "true");
  }

  const response = await fetch(`/api/booking/reservations?${params}`);
  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Erreur lors de la recuperation des reservations"
    );
  }

  return result.data || [];
}

/**
 * Hook pour recuperer les reservations du jour avec React Query
 *
 * Features:
 * - Auto-refresh toutes les 5min (polling)
 * - Refresh au focus de la fenetre
 * - Auto-invalidation a minuit (cache key inclut la date)
 * - Mode public (sans auth) ou filtre par role
 *
 * @returns { reservations, isLoading, error, refetch, isAdminOrDev }
 */
export function useTodayReservations() {
  const { data: session, status: sessionStatus } = useSession();

  const isAuthenticated = sessionStatus === "authenticated";
  const userRole = (session?.user as { role?: string })?.role || "staff";
  const isAdminOrDev = isAuthenticated && ["admin", "dev"].includes(userRole);

  // Recalculated each render - when date changes, cache key changes = auto-refresh
  const today = getTodayParis();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["todayReservations", today, userRole],
    queryFn: () => fetchTodayReservations(today, isAuthenticated),
    enabled: sessionStatus !== "loading",
    staleTime: 2 * 60 * 1000, // 2min - data considered fresh
    refetchInterval: 5 * 60 * 1000, // Poll every 5min for new reservations
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  return {
    reservations: data || [],
    isLoading,
    error: error ? String(error) : null,
    refetch,
    isAdminOrDev,
  };
}
