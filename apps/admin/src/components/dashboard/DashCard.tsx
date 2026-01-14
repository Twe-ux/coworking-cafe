"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useRangeData } from "@/hooks/useDashboardData";
import { useMemo } from "react";

interface DashCardProps {
  title: string;
  range: string;
  compareRange: string;
  checked: boolean; // true = TTC, false = HT
}

export function DashCard({
  title,
  range,
  compareRange,
  checked,
}: DashCardProps) {
  const { mainData, compareData, isLoading, error } = useRangeData(
    range,
    compareRange
  );

  const AmountFormatter = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }),
    []
  );

  // Calcul des données
  const value = useMemo(() => {
    if (!mainData) return 0;
    return checked ? mainData.TTC : mainData.HT;
  }, [mainData, checked]);

  const compareValue = useMemo(() => {
    if (!compareData) return 0;
    return checked ? compareData.TTC : compareData.HT;
  }, [compareData, checked]);

  const percentageChange = useMemo(() => {
    if (!mainData || !compareData || compareValue === 0) return 0;
    return ((value - compareValue) / compareValue) * 100;
  }, [value, compareValue, mainData, compareData]);

  const isPositive = percentageChange >= 0;

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error || !mainData) {
    return (
      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-sm text-destructive">
            {error || "Données non disponibles"}
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Badge variant="outline" className="gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={isPositive ? "text-green-500" : "text-red-500"}
            >
              {percentageChange.toFixed(1)}%
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold tabular-nums">
            {AmountFormatter.format(value)}
          </div>
          <div className="text-xs text-muted-foreground">
            {checked ? "TTC" : "HT"}
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Comparé: {AmountFormatter.format(compareValue)}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {AmountFormatter.format(value - compareValue)} vs période
            précédente
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
