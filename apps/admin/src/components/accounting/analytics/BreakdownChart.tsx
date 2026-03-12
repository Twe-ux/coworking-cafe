import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { RevenueBreakdown } from '@/types/accounting';

interface BreakdownChartProps {
  data: RevenueBreakdown;
}

const COLORS = {
  bookings: '#3b82f6',
  products: '#8b5cf6',
  services: '#10b981',
  b2b: '#f59e0b',
};

export function BreakdownChart({ data }: BreakdownChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const total = data.bookings + data.products + data.services + data.b2b;

  const chartData = [
    {
      name: 'Réservations',
      value: data.bookings,
      percentage: calculatePercentage(data.bookings, total),
      color: COLORS.bookings,
    },
    {
      name: 'Produits',
      value: data.products,
      percentage: calculatePercentage(data.products, total),
      color: COLORS.products,
    },
    {
      name: 'Services',
      value: data.services,
      percentage: calculatePercentage(data.services, total),
      color: COLORS.services,
    },
    {
      name: 'B2B',
      value: data.b2b,
      percentage: calculatePercentage(data.b2b, total),
      color: COLORS.b2b,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {formatCurrency(data.value)} ({data.percentage}%)
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Répartition du CA</h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
          />

          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            tickFormatter={formatCurrency}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value, entry: any) => `${entry.payload.name} (${entry.payload.percentage}%)`}
          />

          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <p className="text-xs text-gray-600">{item.name}</p>
              <p className="text-sm font-semibold">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
