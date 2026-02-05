"use client";

import { useState, useEffect, useCallback } from "react";
import TimeEntriesList from "@/components/clocking/TimeEntriesList";
import { ClockingAdminPageSkeleton } from "./ClockingAdminPageSkeleton";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import type { Employee } from "@/types/hr";

export default function ClockingAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active employees
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        // Filtrer pour masquer le compte Admin Dev (compte technique pour tests)
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

  const handlePreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

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

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={handleToday}
            className="min-w-[200px]"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {currentDate.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </Button>

          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time Entries List */}
      {employees.length > 0 ? (
        <TimeEntriesList employees={employees} currentDate={currentDate} />
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
