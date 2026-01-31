import { useState, useEffect, useCallback } from 'react';

interface UseUnreadContactMessagesReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer le nombre de messages de contact non lus
 * - Polling automatique toutes les 30 secondes
 * - Rafraîchissement quand la page redevient visible
 * - Met à jour le badge PWA mobile automatiquement
 */
export function useUnreadContactMessages(): UseUnreadContactMessagesReturn {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Met à jour le badge PWA sur l'icône de l'app mobile
   */
  const updatePWABadge = useCallback((count: number) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count);
      } else {
        (navigator as any).clearAppBadge();
      }
    }
  }, []);

  /**
   * Récupère le nombre de messages non lus depuis l'API
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/messages/contact/unread-count');

      // Si 401 (non authentifié), on ignore silencieusement (mode staff sans auth)
      if (response.status === 401) {
        setUnreadCount(0);
        updatePWABadge(0);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération');
      }

      const count = data.data?.count || 0;
      setUnreadCount(count);

      // Met à jour le badge PWA mobile
      updatePWABadge(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  }, [updatePWABadge]);

  // Fetch initial
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Polling toutes les 60 secondes (réduit pour limiter les connexions DB)
  useEffect(() => {
    const interval = setInterval(() => {
      // Ne pas fetcher si l'onglet n'est pas visible
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    }, 60000); // 60 secondes

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Rafraîchir quand la page redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
}
