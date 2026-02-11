"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import TimeEntriesList from "@/components/clocking/TimeEntriesList";
import { ClockingAdminPageSkeleton } from "./ClockingAdminPageSkeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CalendarDays, Info } from "lucide-react";
import type { Employee } from "@/types/hr";

export default function ClockingAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        const filteredEmployees = (result.data || []).filter((emp: Employee) => {
          return emp.email !== "dev@coworkingcafe.com" &&
                 !(emp.firstName === "Admin" && emp.lastName === "Dev");
        });
        setEmployees(filteredEmployees);
      } else {
        setError(result.error || "Erreur lors de la récupération des employés");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  if (isLoading) {
    return <ClockingAdminPageSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Récapitulatif des pointages</h1>
          <p className="text-gray-600">
            Visualisez et gérez les pointages de tous les employés
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/hr/schedule">
            <CalendarDays className="mr-2 h-4 w-4" />
            Planning
          </Link>
        </Button>
      </div>

      {/* Time Entries List */}
      {employees.length > 0 ? (
        <TimeEntriesList
          employees={employees}
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-lg border">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Aucun employé actif</p>
            <p className="mt-1 text-sm">
              Ajoutez des employés depuis la section RH
            </p>
          </div>
        </div>
      )}

      {/* Info message */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Note :</strong> Vous pouvez modifier les heures de pointage en
          cliquant sur les cellules. Les modifications sont enregistrées
          automatiquement.
        </AlertDescription>
      </Alert>
    </div>
  );
}
