import { useState, useEffect } from 'react';

interface UsePendingUnavailabilitiesReturn {
  pendingCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch count of pending unavailability requests
 */
export function usePendingUnavailabilities(): UsePendingUnavailabilitiesReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/unavailability/pending');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération');
      }

      setPendingCount(data.data?.count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  };
}
