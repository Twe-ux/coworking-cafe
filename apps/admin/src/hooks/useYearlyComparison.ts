import { useQuery } from '@tanstack/react-query';

interface YearlyComparisonData {
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
    current: number;
    previous: number;
    evolution: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  }>;
}

export function useYearlyComparison(
  currentYear: number,
  previousYear: number,
  mode: 'ht' | 'ttc'
) {
  return useQuery<YearlyComparisonData>({
    queryKey: ['yearly-comparison', currentYear, previousYear, mode],
    queryFn: async () => {
      const params = new URLSearchParams({
        currentYear: currentYear.toString(),
        previousYear: previousYear.toString(),
        mode,
      });

      const res = await fetch(`/api/accounting/analytics/yearly?${params}`);

      if (!res.ok) {
        const error = await res.json().catch(() => ({
          message: 'Failed to fetch yearly comparison',
        }));
        throw new Error(error.message || 'Failed to fetch yearly comparison');
      }

      const result = await res.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
