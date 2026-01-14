import {
  Bar,
  BarChart,
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

interface ChartBarViewProps {
  data: ChartDataPoint[];
}

export function ChartBarView({ data }: ChartBarViewProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
        <Bar dataKey="lastYear" name="Année -1" fill="#3b82f6" />
        <Bar dataKey="thisYear" name="Cette année" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
