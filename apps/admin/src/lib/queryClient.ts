import { QueryClient } from "@tanstack/react-query";

/**
 * Configuration globale du QueryClient pour React Query
 * - staleTime: 5min (refresh automatique des données)
 * - gcTime: 30min (garbage collection du cache)
 * - Refetch au focus de la fenêtre (données fraîches)
 * - Retry automatique sur erreur (3 tentatives)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
