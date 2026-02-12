import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";

/**
 * Get current date in YYYY-MM-DD format (local timezone)
 * Used as cache key to auto-refresh daily
 */
function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Fetch home page data (employees + shifts)
 */
async function fetchHomePageData(): Promise<{
  employees: Employee[];
  shifts: Shift[];
}> {
  const [employeesRes, shiftsRes] = await Promise.all([
    fetch("/api/hr/employees?status=active"),
    fetch("/api/shifts?active=true"),
  ]);

  const employeesData = await employeesRes.json();
  const shiftsData = await shiftsRes.json();

  if (!employeesData.success || !shiftsData.success) {
    throw new Error("Erreur lors du chargement des données");
  }

  return {
    employees: employeesData.data || [],
    shifts: shiftsData.data || [],
  };
}

/**
 * Hook for home page data with automatic daily refresh
 *
 * Features:
 * - Auto-refresh every day at midnight (cache key includes date)
 * - Global cache config: 24h staleTime in prod
 * - Shared cache across all instances
 * - No manual refresh needed
 *
 * Cache behavior:
 * - First access of the day: Fetch fresh data
 * - Subsequent accesses same day: Use cached data
 * - Next day: New cache key = automatic fresh data
 */
export function useHomePageDataQuery() {
  const today = getTodayKey();

  const { data, isLoading, error, refetch } = useQuery({
    // Query key includes today's date = auto-refresh daily
    queryKey: ["homePage", today],
    queryFn: fetchHomePageData,
    // Auto-refresh every 5 minutes when tab is active
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  return {
    employees: data?.employees || [],
    shifts: data?.shifts || [],
    isLoading,
    error: error ? String(error) : null,
    refetch,
  };
}
