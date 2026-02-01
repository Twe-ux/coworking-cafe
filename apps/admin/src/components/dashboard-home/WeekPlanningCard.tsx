"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useWeekPlanning } from "@/hooks/useWeekPlanning";

/**
 * Card de planning de la semaine pour la page d'accueil
 * Affiche un mini calendrier avec les shifts de la semaine en cours
 *
 * Respecte CLAUDE.md :
 * - Composant < 200 lignes
 * - Logique extraite dans useWeekPlanning hook
 * - Types importés depuis /types/
 * - Dates en format string
 */
export function WeekPlanningCard() {
  const { shifts, isLoading, error, weekDates } = useWeekPlanning();

  // Grouper les shifts par jour
  const shiftsByDay = shifts.reduce((acc, shift) => {
    const date = shift.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, typeof shifts>);

  // Générer les 7 jours de la semaine
  const weekDays = [];
  const { monday } = weekDates;
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = day.toISOString().split("T")[0];
    weekDays.push({
      date: dateStr,
      dayName: day.toLocaleDateString("fr-FR", { weekday: "short" }),
      dayNumber: day.getDate(),
      shifts: shiftsByDay[dateStr] || [],
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>Planning de la semaine</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {weekDays[0]?.dayNumber} - {weekDays[6]?.dayNumber}{" "}
              {new Date(monday).toLocaleDateString("fr-FR", { month: "long" })}
            </p>
          </div>
        </div>
        <Link href="/admin/hr/schedule">
          <Button variant="ghost" size="sm" className="gap-2">
            Voir planning complet
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Chargement...
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            Erreur: {error}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isToday =
                day.date === new Date().toISOString().split("T")[0];

              return (
                <div
                  key={day.date}
                  className={`
                    flex flex-col items-center p-2 rounded-lg border
                    ${isToday ? "bg-blue-50 border-blue-200" : "bg-muted/30"}
                  `}
                >
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    {day.dayName}
                  </span>
                  <span
                    className={`
                      text-lg font-semibold mt-1
                      ${isToday ? "text-blue-600" : ""}
                    `}
                  >
                    {day.dayNumber}
                  </span>

                  {day.shifts.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="mt-2 text-xs px-1.5 py-0.5"
                    >
                      {day.shifts.length}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !error && shifts.length === 0 && (
          <div className="text-center text-muted-foreground py-4 mt-4">
            Aucun shift planifié cette semaine
          </div>
        )}

        {!isLoading && !error && shifts.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total shifts cette semaine
              </span>
              <Badge variant="outline" className="font-semibold">
                {shifts.length}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
