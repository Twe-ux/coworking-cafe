"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { ChartControls } from "./chart/ChartControls";
import { ChartAreaView } from "./chart/ChartAreaView";
import { ChartBarView } from "./chart/ChartBarView";
import { ChartSummary } from "./chart/ChartSummary";

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

        <ChartControls
          daysRange={daysRange}
          chartType={chartType}
          onDaysRangeChange={setDaysRange}
          onChartTypeChange={setChartType}
        />
      </CardHeader>

      <CardContent>
        {chartType === "area" ? (
          <ChartAreaView data={chartData} />
        ) : (
          <ChartBarView data={chartData} />
        )}

        <ChartSummary
          thisYearTotal={thisYearTotal}
          lastYearTotal={lastYearTotal}
          growth={growth}
        />
      </CardContent>
    </Card>
  );
}
