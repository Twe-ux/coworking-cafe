import { useQuery } from '@tanstack/react-query';

interface RevenueBreakdownRow {
  period: string;
  label: string;
  b2c: number;
  b2b: number;
  total: number;
}

export function useYearlyBreakdown(year: number, mode: 'ht' | 'ttc') {
  return useQuery<RevenueBreakdownRow[]>({
    queryKey: ['yearly-breakdown', year, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/breakdown/yearly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch yearly breakdown');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyBreakdown(year: number, month: number, mode: 'ht' | 'ttc') {
  return useQuery<RevenueBreakdownRow[]>({
    queryKey: ['monthly-breakdown', year, month, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/breakdown/monthly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch monthly breakdown');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyBreakdown(year: number, mode: 'ht' | 'ttc') {
  return useQuery<RevenueBreakdownRow[]>({
    queryKey: ['weekly-breakdown', year, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        mode,
      });
      const res = await fetch(`/api/accounting/analytics/breakdown/weekly?${params}`);
      if (!res.ok) throw new Error('Failed to fetch weekly breakdown');
      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
