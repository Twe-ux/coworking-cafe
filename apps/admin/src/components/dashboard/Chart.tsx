"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Chart - Placeholder pour les graphiques financiers
 * TODO: Implémenter avec Chart.js ou Recharts
 */
export function Chart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Graphiques</CardTitle>
        <CardDescription>
          Évolution des revenus et chiffre d'affaires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Graphiques à venir
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chart.js / Recharts à implémenter
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
