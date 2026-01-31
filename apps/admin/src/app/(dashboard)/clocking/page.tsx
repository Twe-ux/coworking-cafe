"use client";

import TimeTrackingCard from "@/components/shared/TimeTrackingCard";
import { ErrorDisplay } from "@/components/ui/error-display";
import type { Employee } from "@/types/hr";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { StaffClockingPageSkeleton } from "./StaffClockingPageSkeleton";

export default function ClockingPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        setEmployees(result.data || []);
      } else {
        setError(result.error || "Erreur lors de la recuperation des employes");
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

  const handleStatusChange = () => {
    fetchEmployees();
  };

  if (isLoading) {
    return <StaffClockingPageSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchEmployees} />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pointage</h1>
          <p className="text-gray-600">
            Pointer l'arrivee et le depart des employes
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-sm">{employees.length} employes actifs</span>
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
        <div className="flex h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Aucun employe actif</p>
            <p className="mt-1 text-sm">
              Ajoutez des employes depuis la section RH
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Chaque employe peut effectuer maximum 2
          pointages par jour. Cliquez sur une carte pour commencer ou arreter un
          pointage.
        </p>
      </div>
    </div>
  );
}
