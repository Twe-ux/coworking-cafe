import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/types/accounting';

interface RevenueChartProps {
  data: ChartDataPoint[];
  mode: 'ht' | 'ttc';
}

export function RevenueChart({ data, mode }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data.map((point) => ({
    displayDate: point.displayDate,
    current: mode === 'ht' ? point.current.ht : point.current.ttc,
    comparison: point.comparison
      ? mode === 'ht'
        ? point.comparison.ht
        : point.comparison.ttc
      : undefined,
  }));

  const hasComparison = chartData.some((point) => point.comparison !== undefined);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Évolution du CA</h3>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="displayDate"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
          />

          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value: number | undefined) => formatCurrency(value || 0)}
          />

          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          <Line
            type="monotone"
            dataKey="current"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Période actuelle"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />

          {hasComparison && (
            <Line
              type="monotone"
              dataKey="comparison"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Comparaison"
              dot={{ fill: '#94a3b8', r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
