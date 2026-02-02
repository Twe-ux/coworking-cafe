import { useState, useEffect, useCallback, useRef } from "react";

interface SidebarCounts {
  pendingBookings: number;
  unreadMessages: number;
  pendingUnavailabilities: number;
}

interface UseSidebarCountsReturn {
  counts: SidebarCounts;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DEFAULT_COUNTS: SidebarCounts = {
  pendingBookings: 0,
  unreadMessages: 0,
  pendingUnavailabilities: 0,
};

const POLLING_INTERVAL = 300_000; // 5 minutes

/**
 * Consolidated hook for all sidebar badge counts.
 * Single API call instead of 3 separate ones.
 * Polls every 5 min + refreshes on visibility change.
 */
export function useSidebarCounts(): UseSidebarCountsReturn {
  const [counts, setCounts] = useState<SidebarCounts>(DEFAULT_COUNTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  const updatePWABadge = useCallback((total: number) => {
    if ("setAppBadge" in navigator) {
      if (total > 0) {
        (navigator as Navigator & { setAppBadge: (n: number) => void }).setAppBadge(total);
      } else if ("clearAppBadge" in navigator) {
        (navigator as Navigator & { clearAppBadge: () => void }).clearAppBadge();
      }
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      setError(null);

      const response = await fetch("/api/sidebar-counts");

      if (response.status === 401) {
        setCounts(DEFAULT_COUNTS);
        updatePWABadge(0);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération");
      }

      const newCounts: SidebarCounts = {
        pendingBookings: data.data?.pendingBookings || 0,
        unreadMessages: data.data?.unreadMessages || 0,
        pendingUnavailabilities: data.data?.pendingUnavailabilities || 0,
      };

      setCounts(newCounts);

      const total =
        newCounts.pendingBookings +
        newCounts.unreadMessages +
        newCounts.pendingUnavailabilities;
      updatePWABadge(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.error("Error fetching sidebar counts:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [updatePWABadge]);

  // Initial fetch
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Polling every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCounts();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCounts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchCounts]);

  return { counts, loading, error, refetch: fetchCounts };
}
