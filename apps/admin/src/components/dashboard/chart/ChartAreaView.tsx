import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  date: string;
  thisYear: number;
  lastYear: number;
}

interface ChartAreaViewProps {
  data: ChartDataPoint[];
}

export function ChartAreaView({ data }: ChartAreaViewProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="fill-muted-foreground text-xs"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          className="fill-muted-foreground text-xs"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `€${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value) => `€${Number(value).toLocaleString()}`}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="lastYear"
          name="Année -1"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="thisYear"
          name="Cette année"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
