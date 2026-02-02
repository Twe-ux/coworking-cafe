import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ComparisonStats } from "@/types/accounting";

interface ComparisonChartProps {
  data: ComparisonStats;
  showTTC: boolean;
}

export function ComparisonChart({ data, showTTC }: ComparisonChartProps) {
  const { period1, period2 } = data;

  // Préparer les données pour le graphique
  // Format: [{ name: "Caisse", period1: X, period2: Y }, ...]
  const chartData = [
    {
      name: "Caisse",
      [period1.period.label || "Période 1"]: showTTC
        ? period1.turnovers.ttc
        : period1.turnovers.ht,
      [period2.period.label || "Période 2"]: showTTC
        ? period2.turnovers.ttc
        : period2.turnovers.ht,
    },
    {
      name: "B2B",
      [period1.period.label || "Période 1"]: showTTC ? period1.b2b.ttc : period1.b2b.ht,
      [period2.period.label || "Période 2"]: showTTC ? period2.b2b.ttc : period2.b2b.ht,
    },
    {
      name: "Total",
      [period1.period.label || "Période 1"]: showTTC
        ? period1.total.ttc
        : period1.total.ht,
      [period2.period.label || "Période 2"]: showTTC
        ? period2.total.ttc
        : period2.total.ht,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison visuelle {showTTC ? "TTC" : "HT"}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number | undefined) =>
                value !== undefined ? `${value.toFixed(2)} €` : "N/A"
              }
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Legend />
            <Bar
              dataKey={period1.period.label || "Période 1"}
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey={period2.period.label || "Période 2"}
              fill="hsl(var(--secondary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
