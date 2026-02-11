import { useState, useEffect, useCallback, useRef } from 'react';
import type { IUnavailabilityWithEmployee, UnavailabilityStatus } from '@/types/unavailability';

interface UseUnavailabilitiesOptions {
  employeeId?: string;
  status?: UnavailabilityStatus;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean;
}

interface UseUnavailabilitiesReturn {
  unavailabilities: IUnavailabilityWithEmployee[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUnavailability: (data: CreateUnavailabilityData) => Promise<{ success: boolean; error?: string }>;
  updateUnavailability: (id: string, data: UpdateUnavailabilityData) => Promise<{ success: boolean; error?: string }>;
  deleteUnavailability: (id: string) => Promise<{ success: boolean; error?: string }>;
}

interface CreateUnavailabilityData {
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  reason?: string;
}

interface UpdateUnavailabilityData {
  status?: UnavailabilityStatus;
  rejectionReason?: string;
  startDate?: string;
  endDate?: string;
  type?: 'vacation' | 'sick' | 'personal' | 'other';
  reason?: string;
}

export function useUnavailabilities(options: UseUnavailabilitiesOptions = {}): UseUnavailabilitiesReturn {
  const {
    employeeId,
    status,
    startDate,
    endDate,
    autoFetch = true,
  } = options;

  const [unavailabilities, setUnavailabilities] = useState<IUnavailabilityWithEmployee[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUnavailabilities = useCallback(async () => {
    // Cancel any in-flight request to prevent stale data from overwriting
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (employeeId) params.set('employeeId', employeeId);
      if (status) params.set('status', status);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/unavailability?${params}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      setUnavailabilities(data.data || []);
    } catch (err) {
      // Ignore abort errors (expected when switching months fast)
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('❌ Erreur useUnavailabilities:', err);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [employeeId, status, startDate, endDate]);

  const createUnavailability = useCallback(async (data: CreateUnavailabilityData) => {
    try {
      const response = await fetch('/api/unavailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchUnavailabilities();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [fetchUnavailabilities]);

  const updateUnavailability = useCallback(async (id: string, data: UpdateUnavailabilityData) => {
    try {
      const response = await fetch(`/api/unavailability/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchUnavailabilities();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [fetchUnavailabilities]);

  const deleteUnavailability = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/unavailability/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchUnavailabilities();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [fetchUnavailabilities]);

  useEffect(() => {
    if (autoFetch) {
      fetchUnavailabilities();
    }
  }, [autoFetch, fetchUnavailabilities]);

  return {
    unavailabilities,
    loading,
    error,
    refetch: fetchUnavailabilities,
    createUnavailability,
    updateUnavailability,
    deleteUnavailability,
  };
}
