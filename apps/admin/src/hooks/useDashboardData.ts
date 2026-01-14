import { useQuery } from "@tanstack/react-query";

interface RangeData {
  TTC: number;
  HT: number;
}

interface DashboardApiResponse {
  success: boolean;
  data: Record<string, RangeData>;
  timestamp: string;
}

/**
 * Récupère les données du dashboard depuis l'API
 */
async function fetchDashboardData(): Promise<Record<string, RangeData>> {
  const response = await fetch("/api/dashboard");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: DashboardApiResponse = await response.json();

  if (!result.success) {
    throw new Error("Failed to fetch dashboard data");
  }

  return result.data;
}

/**
 * Hook pour récupérer toutes les données du dashboard
 * Utilise React Query pour le cache et la gestion d'état
 *
 * @returns {object} - { data, isLoading, error }
 */
export function useDashboardData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  });

  return {
    data: data || null,
    isLoading,
    error: error ? String(error) : null,
  };
}

/**
 * Hook spécialisé pour extraire les données d'une range spécifique
 *
 * @param range - La période principale (ex: "week", "month", "year")
 * @param compareRange - La période de comparaison optionnelle
 * @returns {object} - { mainData, compareData, isLoading, error }
 */
export function useRangeData(range: string, compareRange?: string) {
  const { data, isLoading, error } = useDashboardData();

  if (!data || isLoading) {
    return {
      mainData: null,
      compareData: null,
      isLoading,
      error,
    };
  }

  const mainData = data[range] || null;
  const compareData = compareRange ? data[compareRange] || null : null;

  return {
    mainData,
    compareData,
    isLoading: false,
    error,
  };
}
