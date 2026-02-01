import { useState, useEffect, useCallback } from "react";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";

/**
 * Hook pour récupérer les données de la page d'accueil
 * - Employees actifs
 * - Shifts actifs
 *
 * Respecte CLAUDE.md : Hook < 150 lignes
 */
export function useHomePageData() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return {
    employees,
    shifts,
    isLoading,
    error,
    refetch: fetchData,
  };
}
