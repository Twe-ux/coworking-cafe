import { useState, useEffect } from 'react';

interface UsePendingBookingsReturn {
  pendingCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch count of pending bookings
 * Polls every 60 seconds when tab is visible
 */
export function usePendingBookings(): UsePendingBookingsReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/booking/pending-count');
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

    // Polling every 60 seconds (reduced for DB connection limit)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchPendingCount();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPendingCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  };
}
