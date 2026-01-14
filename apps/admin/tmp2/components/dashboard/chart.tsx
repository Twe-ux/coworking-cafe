"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useChartData } from "@/hooks/use-chart-data-fixed";
import { useIsMobile } from "@/hooks/use-mobile";
import { prepareChartData } from "@/lib/reporting-utils";
import React, { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  TTC: {
    label: "TTC",
    color: "var(--chart-4)",
  },
  HT: {
    label: "HT",
    color: "var(--chart-5 )",
  },
} satisfies ChartConfig;

export function Chart() {
  const [isClient, setIsClient] = React.useState(false);
  const { data: turnoverData, isLoading, error } = useChartData();

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");
  const [range, setRange] = React.useState("30 derniers jours");

  // S'assurer que le composant s'affiche côté client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Déplacer useMemo avant le return conditionnel pour respecter les règles des hooks
  const filteredData = useMemo(() => {
    // Ne traiter les données que côté client pour éviter les erreurs d'hydratation
    if (!isClient || !turnoverData || !Array.isArray(turnoverData)) return [];

    const filtered = turnoverData.filter((data) => {
      // Améliorer la gestion des dates
      let date: Date;

      // Essayer plusieurs formats de date
      if (typeof data.date === "string") {
        if (data.date.match(/^\d{4}[-/]\d{2}[-/]\d{2}/)) {
          date = new Date(data.date);
        } else if (data.date.match(/^\d+$/)) {
          date = new Date(parseInt(data.date));
        } else {
          date = new Date(data.date);
        }
      } else {
        date = new Date(data.date);
      }

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn(
          "Date invalide dans le filtre:",
          data.date,
          "pour data:",
          data,
        );
        return false; // Exclure les données avec des dates invalides
      }

      const referenceDate = new Date();
      let daysToSubtract = 365;
      if (timeRange === "90d") {
        daysToSubtract = 90;
      } else if (timeRange === "30d") {
        daysToSubtract = 31;
      } else if (timeRange === "7d") {
        daysToSubtract = 8;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);

      return date >= startDate;
    });

    return prepareChartData(filtered);
  }, [isClient, turnoverData, timeRange]);

  // Afficher un état de chargement uniforme côté serveur et client
  if (!isClient || isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaire</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Tendance sur les 30 derniers jours
            </span>
            <span className="@[540px]/card:hidden">30 derniers jours</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-muted-foreground animate-pulse">
              Chargement du graphique...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaire</CardTitle>
          <CardDescription>Erreur lors du chargement</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-red-500">
              Impossible de charger les données du graphique
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Chiffre d&apos;affaire</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {range === "Année"
              ? "Tendance sur l'année"
              : `Tendance sur les ${range}`}
          </span>
          <span className="@[540px]/card:hidden">{range}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem
              value="365d"
              onClick={() => {
                setRange("Année");
              }}
            >
              Année
            </ToggleGroupItem>
            <ToggleGroupItem
              value="90d"
              onClick={() => {
                setRange("3 derniers mois");
              }}
            >
              3 derniers mois
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              onClick={() => {
                setRange("30 derniers jours");
              }}
            >
              30 derniers jours
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              onClick={() => {
                setRange("7 derniers jours");
              }}
            >
              7 derniers jours
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="3 derniers mois" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="365d" className="rounded-lg">
                Année
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillHT" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-HT)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-HT)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTTC" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-TTC)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-TTC)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(8, 10)}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    // Essayer d'utiliser rawDate si disponible dans le payload
                    const dataPoint = payload?.[0]?.payload;
                    const dateToUse = dataPoint?.rawDate || value;

                    const dateObj = new Date(dateToUse);
                    if (isNaN(dateObj.getTime())) {
                      console.warn("Date invalide dans le tooltip:", dateToUse);
                      return String(value);
                    }

                    return dateObj.toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="TTC"
              type="natural"
              fill="url(#fillTTC)"
              stroke={chartConfig.TTC.color}
            />
            <Area
              dataKey="HT"
              type="natural"
              fill="url(#fillHT)"
              stroke={chartConfig.HT.color}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
