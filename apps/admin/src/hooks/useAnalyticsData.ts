import { useQuery } from '@tanstack/react-query';
import type { AnalyticsResponse } from '@/types/accounting';

interface AnalyticsFilters {
  period: 'day' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  compareWith?: 'previous' | 'year-ago' | 'month-year-ago';
  mode: 'ht' | 'ttc';
}

export function useAnalyticsData(filters: AnalyticsFilters) {
  return useQuery<AnalyticsResponse>({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', filters.period);

      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      if (filters.compareWith) {
        params.append('compareWith', filters.compareWith);
      }

      params.append('mode', filters.mode);

      const res = await fetch(`/api/accounting/analytics?${params}`);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to fetch analytics' }));
        throw new Error(error.message || 'Failed to fetch analytics');
      }

      const result = await res.json();
      return result.data; // Extract data from { success: true, data: {...} }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export type { AnalyticsFilters };
