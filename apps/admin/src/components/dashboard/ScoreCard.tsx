"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";

/**
 * ScoreCard - Affiche les scores des employés (staff uniquement)
 * TODO: Implémenter avec les vraies données staff
 */
export function ScoreCard() {
  const { isStaff } = useRole();

  // Visible uniquement pour le staff
  if (!isStaff) {
    return null;
  }

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Votre Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[150px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Système de scoring à venir
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Affichage des performances personnelles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
