import { useQuery } from "@tanstack/react-query"
import type { Turnover } from "@/types/accounting"
import { accountingApi } from "@/lib/api/accounting"

interface UseTurnoverDataParams {
  startDate?: string
  endDate?: string
}

/**
 * Récupère les turnovers depuis l'API
 */
async function fetchTurnovers(
  params?: UseTurnoverDataParams
): Promise<Turnover[]> {
  return accountingApi.turnovers.list(params)
}

/**
 * Hook pour récupérer les turnovers
 * Utilise React Query pour le cache et la gestion d'état
 *
 * @param params - Filtres optionnels (startDate, endDate)
 * @returns {object} - { dataTurnover, isLoading, error, refetch }
 */
export function useTurnoverData(params?: UseTurnoverDataParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["turnovers", params],
    queryFn: () => fetchTurnovers(params),
  })

  return {
    dataTurnover: data ?? [],
    isLoading,
    error: error ? String(error) : null,
    refetch,
    invalidate: refetch, // Alias pour compatibilité
  }
}
