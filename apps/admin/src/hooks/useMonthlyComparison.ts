import { useQuery } from '@tanstack/react-query';

interface MonthlyComparisonData {
  summary: {
    total: {
      current: number;
      previous: number;
      evolution: {
        amount: number;
        percentage: number;
        trend: 'up' | 'down' | 'stable';
      };
    };
    average: number;
    best: { period: string; value: number };
    worst: { period: string; value: number };
  };
  rows: Array<{
    period: string;
    date?: string;
    current: number;
    previous: number;
    evolution: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  }>;
}

export function useMonthlyComparison(
  year: number,
  month: number,
  previousYear: number,
  mode: 'ht' | 'ttc'
) {
  return useQuery<MonthlyComparisonData>({
    queryKey: ['monthly-comparison', year, month, previousYear, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
        previousYear: previousYear.toString(),
        mode,
      });

      const res = await fetch(`/api/accounting/analytics/monthly?${params}`);

      if (!res.ok) {
        const error = await res.json().catch(() => ({
          message: 'Failed to fetch monthly comparison',
        }));
        throw new Error(error.message || 'Failed to fetch monthly comparison');
      }

      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
