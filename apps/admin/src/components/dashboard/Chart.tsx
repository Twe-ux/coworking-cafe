"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

interface DailyComparisonData {
  date: string;
  displayDate: string;
  thisYear: {
    TTC: number;
    HT: number;
  };
  lastYear: {
    TTC: number;
    HT: number;
  };
}

interface ChartProps {
  mode: "HT" | "TTC";
}

/**
 * Chart - Comparaison CA année vs année (jour par jour)
 */
export function Chart({ mode }: ChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [daysRange, setDaysRange] = useState<7 | 30 | 90>(7);
  const [comparisonData, setComparisonData] = useState<
    DailyComparisonData[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{ date: string; thisYear: number; lastYear: number }>
  >([]);

  // Fetch data pour la comparaison année vs année
  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?days=${daysRange}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setComparisonData(result.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur chargement comparaison:", error);
        setLoading(false);
      });
  }, [daysRange]);

  // Recalculer chartData quand mode ou comparisonData change
  useEffect(() => {
    if (!comparisonData) {
      setChartData([]);
      return;
    }

    const value = mode === "TTC" ? "TTC" : "HT";
    const newData = comparisonData.map((entry) => ({
      date: entry.displayDate,
      thisYear: entry.thisYear[value],
      lastYear: entry.lastYear[value],
    }));
    setChartData(newData);
  }, [comparisonData, mode]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Année vs Année</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comparisonData || comparisonData.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Année vs Année</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucune donnée disponible pour cette période
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const thisYearTotal = chartData.reduce(
    (sum, item) => sum + item.thisYear,
    0
  );
  const lastYearTotal = chartData.reduce(
    (sum, item) => sum + item.lastYear,
    0
  );
  const growth =
    lastYearTotal > 0
      ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-muted p-2">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Comparaison Année vs Année</CardTitle>
            <CardDescription>
              CA jour par jour sur {daysRange} jours ({mode})
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={daysRange.toString()}
            onValueChange={(value: string) => setDaysRange(parseInt(value) as 7 | 30 | 90)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={chartType}
            onValueChange={(value: string) => setChartType(value as "area" | "bar")}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Zone</SelectItem>
              <SelectItem value="bar">Barres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "area" ? (
            <AreaChart data={chartData}>
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
          ) : (
            <BarChart data={chartData}>
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
          )}
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <div className="text-xs text-muted-foreground">Année -1</div>
              <div className="font-semibold">
                €{Math.round(lastYearTotal).toLocaleString()}
              </div>
            </div>
            <div className="h-3 w-3 rounded bg-blue-500" />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div>
              <div className="text-xs text-muted-foreground">Cette année</div>
              <div className="font-semibold">
                €{Math.round(thisYearTotal).toLocaleString()}
              </div>
            </div>
            <div className="h-3 w-3 rounded bg-green-500" />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center rounded-lg bg-muted/50 p-3">
          <TrendingUp
            className={`mr-2 h-4 w-4 ${
              growth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          />
          <span className="text-sm font-medium">
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}% vs année précédente
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
