import { QueryClient } from "@tanstack/react-query";

/**
 * Configuration globale du QueryClient pour React Query
 * - Cache de 5min en dev, 24h en prod
 * - Retry automatique sur erreur (3 tentatives)
 * - Pas de refetch au focus de la fenêtre
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: process.env.NODE_ENV === "development"
        ? 5 * 60 * 1000 // 5 minutes en dev
        : 24 * 60 * 60 * 1000, // 24 heures en prod
      gcTime: 24 * 60 * 60 * 1000, // 24h (anciennement cacheTime)
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
