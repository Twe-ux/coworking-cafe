import { useQuery } from "@tanstack/react-query"
import type { CashEntry } from "@/types/accounting"
import { accountingApi } from "@/lib/api/accounting"

interface UseAccountingDataParams {
  startDate?: string
  endDate?: string
}

/**
 * Récupère les cash entries depuis l'API
 */
async function fetchCashEntries(
  params?: UseAccountingDataParams
): Promise<CashEntry[]> {
  return accountingApi.cashEntries.list(params)
}

/**
 * Hook pour récupérer les cash entries
 * Utilise React Query pour le cache et la gestion d'état
 *
 * @param params - Filtres optionnels (startDate, endDate)
 * @returns {object} - { dataCash, isLoading, error, refetch }
 */
export function useAccountingData(params?: UseAccountingDataParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["cash-entries", params],
    queryFn: () => fetchCashEntries(params),
  })

  return {
    dataCash: data ?? [],
    isLoading,
    error: error ? String(error) : null,
    refetch,
    invalidate: refetch, // Alias pour compatibilité
  }
}
