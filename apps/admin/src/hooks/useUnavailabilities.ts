import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

/**
 * Query key factory for unavailabilities
 */
const unavailabilityKeys = {
  all: ['unavailabilities'] as const,
  lists: () => [...unavailabilityKeys.all, 'list'] as const,
  list: (filters: Omit<UseUnavailabilitiesOptions, 'autoFetch'>) =>
    [...unavailabilityKeys.lists(), filters] as const,
};

/**
 * Fetch unavailabilities from API
 */
async function fetchUnavailabilities(
  options: Omit<UseUnavailabilitiesOptions, 'autoFetch'>
): Promise<IUnavailabilityWithEmployee[]> {
  const params = new URLSearchParams();
  if (options.employeeId) params.set('employeeId', options.employeeId);
  if (options.status) params.set('status', options.status);
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);

  const response = await fetch(`/api/unavailability?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Erreur inconnue');
  }

  return data.data || [];
}

export function useUnavailabilities(options: UseUnavailabilitiesOptions = {}): UseUnavailabilitiesReturn {
  const {
    employeeId,
    status,
    startDate,
    endDate,
    autoFetch = true,
  } = options;

  const queryClient = useQueryClient();
  const filters = { employeeId, status, startDate, endDate };

  const {
    data: unavailabilities = [],
    isLoading,
    error,
    refetch: rqRefetch,
  } = useQuery({
    queryKey: unavailabilityKeys.list(filters),
    queryFn: () => fetchUnavailabilities(filters),
    enabled: autoFetch,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: unavailabilityKeys.lists() });
  }, [queryClient]);

  const refetch = useCallback(async () => {
    await rqRefetch();
  }, [rqRefetch]);

  const createUnavailability = useCallback(async (data: CreateUnavailabilityData) => {
    try {
      const response = await fetch('/api/unavailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      invalidate();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [invalidate]);

  const updateUnavailability = useCallback(async (id: string, data: UpdateUnavailabilityData) => {
    try {
      const response = await fetch(`/api/unavailability/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      invalidate();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [invalidate]);

  const deleteUnavailability = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/unavailability/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      invalidate();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: errorMessage };
    }
  }, [invalidate]);

  return {
    unavailabilities,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    refetch,
    createUnavailability,
    updateUnavailability,
    deleteUnavailability,
  };
}
