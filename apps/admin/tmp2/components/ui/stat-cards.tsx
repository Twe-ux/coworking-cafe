"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AmountDisplay } from "./data-display";

// Types pour les composants de statistiques
export type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
  valueClassName?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
};

export type StatGridProps = {
  stats: StatCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

// Composant pour une carte de statistique
export function StatCard({
  title,
  value,
  description,
  trend,
  className,
  valueClassName,
  icon,
  variant = "default",
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Si c'est un montant (contient des décimales ou est > 1000), le formater comme une devise
      if (val > 1000 || val % 1 !== 0) {
        return <AmountDisplay amount={val} />;
      }
      // Sinon, le formater comme un nombre
      return val.toLocaleString("fr-FR");
    }
    return val;
  };

  const variantClasses = {
    default: "",
    success:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    warning:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    danger: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  };

  return (
    <Card className={cn("@container/card", variantClasses[variant], className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardDescription className="flex items-center gap-2">
              {icon}
              {title}
            </CardDescription>
            <CardTitle
              className={cn(
                "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl",
                valueClassName,
              )}
            >
              {formatValue(value)}
            </CardTitle>
          </div>
          {trend && (
            <CardAction>
              <Badge
                variant="outline"
                className={cn(
                  trend.isPositive
                    ? "border-green-200 text-green-600 dark:border-green-800 dark:text-green-400"
                    : "border-red-200 text-red-600 dark:border-red-800 dark:text-red-400",
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </Badge>
            </CardAction>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
        {trend?.label && (
          <p className="text-muted-foreground text-xs">{trend.label}</p>
        )}
      </CardHeader>
    </Card>
  );
}

// Composant pour une grille de statistiques
export function StatGrid({ stats, columns = 4, className }: StatGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 @xl/main:grid-cols-2",
    3: "grid-cols-1 @md/main:grid-cols-2 @4xl/main:grid-cols-3",
    4: "grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4",
  };

  return (
    <div
      className={cn("grid gap-4 px-4 lg:px-6", gridClasses[columns], className)}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Hook pour calculer les tendances
export function useTrend(current: number, previous: number) {
  if (previous === 0) return null;

  const change = ((current - previous) / previous) * 100;

  return {
    value: Math.round(change * 100) / 100,
    isPositive: change >= 0,
    label: `vs période précédente`,
  };
}

// Composant pour des statistiques rapides en ligne
export function QuickStats({
  stats,
  className,
}: {
  stats: Array<{
    label: string;
    value: string | number;
    variant?: "positive" | "negative" | "neutral";
  }>;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-6 px-4 lg:px-6", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              stat.variant === "positive" &&
                "text-green-600 dark:text-green-400",
              stat.variant === "negative" && "text-red-600 dark:text-red-400",
              stat.variant === "neutral" && "text-muted-foreground",
            )}
          >
            {typeof stat.value === "number"
              ? stat.value.toLocaleString("fr-FR")
              : stat.value}
          </div>
          <div className="text-muted-foreground text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
