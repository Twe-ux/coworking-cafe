"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Clock } from "lucide-react";
import TimeTrackingCard from "@/components/shared/TimeTrackingCard";
import { WeekCard } from "@/components/employee-scheduling/scheduling/WeekCard";
import { useScheduleData } from "@/components/employee-scheduling/scheduling/useScheduleData";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import type { WeekData } from "@/components/employee-scheduling/scheduling/types";

/**
 * Page d'accueil "/" - Vue fullscreen sans sidebar
 *
 * Affiche dans une grande card :
 * - En haut : Planning de la semaine en cours
 * - En bas : Pointages de tous les employés
 * - Bouton "Voir tous" → /my-schedule
 *
 * Respecte CLAUDE.md : < 150 lignes, logique simple
 */
export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees et shifts
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [employeesRes, shiftsRes] = await Promise.all([
        fetch("/api/hr/employees?status=active"),
        fetch("/api/shifts?active=true"),
      ]);

      const employeesData = await employeesRes.json();
      const shiftsData = await shiftsRes.json();

      if (!employeesData.success || !shiftsData.success) {
        throw new Error("Erreur lors du chargement des données");
      }

      setEmployees(employeesData.data || []);
      setShifts(shiftsData.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hook pour calculer les données de planning
  const { getShiftsPositionedByEmployee, calculateWeeklyHours } =
    useScheduleData({
      employees,
      shifts,
    });

  // Calculer la semaine en cours
  const getCurrentWeek = (): WeekData => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi = début

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  };

  const currentWeek = getCurrentWeek();

  // Handler refresh après pointage
  const handleStatusChange = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-2xl">
              CoworKing Café - Planning & Pointage
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Link href="/my-schedule">
            <Button variant="outline" className="gap-2">
              Voir tous
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Planning de la semaine en cours */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Planning de la semaine
            </h2>
            <WeekCard
              week={currentWeek}
              employees={employees}
              getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
              calculateWeeklyHours={calculateWeeklyHours}
            />
          </div>

          {/* Pointages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pointage</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{employees.length} employés</span>
              </div>
            </div>

            {employees.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {employees.map((employee) => (
                  <TimeTrackingCard
                    key={employee.id}
                    employee={employee}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                <p>Aucun employé actif</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
