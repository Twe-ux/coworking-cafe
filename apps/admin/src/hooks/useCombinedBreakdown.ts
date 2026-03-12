import { useQuery } from '@tanstack/react-query';

interface CombinedBreakdownRow {
  period: string;
  label: string;
  current: {
    b2c: number;
    b2b: number;
    total: number;
  };
  previous: {
    b2c: number;
    b2b: number;
    total: number;
  };
  evolution: {
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export function useYearlyCombined(
  currentYear: number,
  previousYear: number,
  mode: 'ht' | 'ttc'
) {
  return useQuery<CombinedBreakdownRow[]>({
    queryKey: ['yearly-combined', currentYear, previousYear, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        currentYear: currentYear.toString(),
        previousYear: previousYear.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/combined/yearly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch combined yearly');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyCombined(
  year: number,
  month: number,
  previousYear: number,
  mode: 'ht' | 'ttc'
) {
  return useQuery<CombinedBreakdownRow[]>({
    queryKey: ['monthly-combined', year, month, previousYear, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        previousYear: previousYear.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/combined/monthly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch combined monthly');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyCombined(
  currentYear: number,
  previousYear: number,
  mode: 'ht' | 'ttc'
) {
  return useQuery<CombinedBreakdownRow[]>({
    queryKey: ['weekly-combined', currentYear, previousYear, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        currentYear: currentYear.toString(),
        previousYear: previousYear.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/combined/weekly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch combined weekly');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
