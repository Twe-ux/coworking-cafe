"use client";

import { QuickClockingCard } from "@/components/dashboard-home/QuickClockingCard";
import { WeekPlanningCard } from "@/components/dashboard-home/WeekPlanningCard";
import { TodayReservationsCard } from "@/components/dashboard-home/TodayReservationsCard";

/**
 * Page d'accueil "/" - Dashboard principal
 *
 * Nouveau design fullscreen avec sidebar cachée (spec utilisateur 1-A)
 * Affiche 3 cartes principales :
 * - Pointage rapide (4 premiers employés)
 * - Planning de la semaine (mini calendrier)
 * - Réservations du jour (liste)
 *
 * Respecte CLAUDE.md :
 * - Page < 150 lignes (actuellement ~50)
 * - Logique extraite dans les hooks
 * - Composants réutilisables
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard CoworKing Café
        </h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de la journée -{" "}
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Grid des 3 cartes principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Card 1 : Pointage rapide */}
        <QuickClockingCard />

        {/* Card 2 : Planning de la semaine */}
        <WeekPlanningCard />

        {/* Card 3 : Réservations du jour */}
        <TodayReservationsCard />
      </div>
    </div>
  );
}
