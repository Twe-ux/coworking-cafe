"use client";

import { WeekCard } from "@/components/employee-scheduling/scheduling/WeekCard";
import type { WeekData } from "@/components/employee-scheduling/scheduling/types";
import { useScheduleData } from "@/components/employee-scheduling/scheduling/useScheduleData";
import { PointagesSection } from "@/components/home/PointagesSection";
import { TodayReservationsCard } from "@/components/home/TodayReservationsCard";
import { TodayTasksCard } from "@/components/home/TodayTasksCard";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomePageData } from "@/hooks/useHomePageData";
import { useMemo } from "react";

/**
 * Page d'accueil "/" - Vue fullscreen sans sidebar
 *
 * Affiche :
 * - Header avec logo et date
 * - Pointages de tous les employés actifs
 * - Planning de la semaine en cours
 * - Réservations + Tâches du jour
 */
export default function HomePage() {
  const { employees, shifts, isLoading, error, refetch } = useHomePageData();

  const {
    getShiftsPositionedByEmployee,
    calculateWeeklyHours,
    getWeeksWithShifts,
  } = useScheduleData({
    employees,
    shifts,
  });

  const currentWeek: WeekData | undefined = useMemo(() => {
    const weeks = getWeeksWithShifts();
    return weeks[0];
  }, [getWeeksWithShifts]);

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <HomePageHeader /> */}

      <CardContent className="space-y-2 p-4">
        <PointagesSection employees={employees} onStatusChange={refetch} />

        {currentWeek && (
          <WeekCard
            week={currentWeek}
            employees={employees}
            getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
            calculateWeeklyHours={calculateWeeklyHours}
            showViewAllButton={true}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TodayReservationsCard />
          <TodayTasksCard />
        </div>
      </CardContent>
    </div>
  );
}

/**
 * Skeleton pour la page d'accueil
 */
function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      {/* <div className="flex items-center gap-4 p-6 pb-6">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
      </div> */}

      <div className="space-y-2 p-4">
        {/* Pointages grid */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[52px] rounded-lg" />
          ))}
        </div>

        {/* Planning */}
        <Skeleton className="h-[300px] rounded-lg" />

        {/* Reservations + Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Skeleton className="h-[250px] rounded-lg" />
          <Skeleton className="h-[250px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
