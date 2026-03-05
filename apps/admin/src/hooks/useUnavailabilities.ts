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
 * Fetch absences from NEW API and convert to legacy format
 * Now uses /api/hr/absences instead of /api/unavailability
 */
async function fetchUnavailabilities(
  options: Omit<UseUnavailabilitiesOptions, 'autoFetch'>
): Promise<IUnavailabilityWithEmployee[]> {
  const params = new URLSearchParams();
  if (options.employeeId) params.set('employeeId', options.employeeId);
  if (options.status) params.set('status', options.status);
  if (options.startDate) params.set('startDate', options.startDate);
  if (options.endDate) params.set('endDate', options.endDate);

  // Use NEW absences API
  const response = await fetch(`/api/hr/absences?${params}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Erreur inconnue');
  }

  const absences = data.data || [];

  // Convert new Absence format to legacy Unavailability format
  return absences.map((absence: any) => ({
    _id: absence._id,
    employeeId: typeof absence.employeeId === 'string'
      ? absence.employeeId
      : (absence.employeeId._id || absence.employeeId.id),
    startDate: absence.startDate,
    endDate: absence.endDate,
    reason: absence.reason || '',
    // Keep new types as-is (paid_leave, sick_leave, unavailability)
    // DayCell expects these exact types
    type: absence.type,
    status: absence.status,
    requestedBy: 'employee', // Default
    approvedBy: absence.approvedBy,
    approvedAt: absence.approvedAt,
    rejectionReason: absence.rejectionReason,
    notificationSent: true, // Assume sent
    createdAt: absence.createdAt,
    updatedAt: absence.updatedAt,
    employee: typeof absence.employeeId === 'object' ? {
      _id: absence.employeeId._id || absence.employeeId.id,
      firstName: absence.employeeId.firstName,
      lastName: absence.employeeId.lastName,
      email: absence.employeeId.email,
    } : undefined as any,
  }));
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
      // Convert old type format to new format
      const absenceType = data.type === 'vacation' ? 'paid_leave'
        : data.type === 'sick' ? 'sick_leave'
        : 'unavailability';

      const response = await fetch('/api/hr/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: absenceType,
          status: 'approved', // Auto-approve when created by admin
        }),
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
      // Convert type if provided
      const updateData = { ...data };
      if (data.type) {
        (updateData as any).type = data.type === 'vacation' ? 'paid_leave'
          : data.type === 'sick' ? 'sick_leave'
          : 'unavailability';
      }

      const response = await fetch(`/api/hr/absences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
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
      const response = await fetch(`/api/hr/absences/${id}`, {
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
