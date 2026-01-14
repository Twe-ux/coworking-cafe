import { useState, useCallback } from "react";
import type {
  Employee,
  EmployeeFormData,
  EmployeeFilters,
  APIResponse,
} from "@/types/hr";

/**
 * Hook pour gérer les employés (CRUD + logique métier)
 * Limite : <200 lignes selon CLAUDE.md
 */
export function useEmployeesData() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger tous les employés avec filtres optionnels
   */
  const fetchEmployees = useCallback(async (filters?: EmployeeFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.active !== undefined) {
        params.append("active", filters.active.toString());
      }
      if (filters?.archived) {
        params.append("includeDeleted", "true");
      }

      const response = await fetch(`/api/hr/employees?${params.toString()}`);
      const data: APIResponse<Employee[]> = await response.json();

      if (data.success && data.data) {
        setEmployees(data.data);
      } else {
        setError(data.error || "Erreur lors du chargement");
      }
    } catch (err) {
      setError("Erreur réseau");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un nouvel employé
   */
  const createEmployee = useCallback(
    async (formData: EmployeeFormData): Promise<APIResponse<Employee>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/hr/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            onboardingStatus: {
              step1Completed: true,
              contractGenerated: false,
              dpaeCompleted: false,
              bankDetailsProvided: false,
              contractSent: false,
            },
          }),
        });

        const data: APIResponse<Employee> = await response.json();

        if (data.success) {
          await fetchEmployees();
        } else {
          setError(data.error || "Erreur lors de la création");
        }

        return data;
      } catch (err) {
        const errorMsg = "Erreur réseau";
        setError(errorMsg);
        console.error(err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchEmployees]
  );

  /**
   * Mettre à jour un employé existant
   */
  const updateEmployee = useCallback(
    async (
      employeeId: string,
      updates: Partial<Employee>
    ): Promise<APIResponse<Employee>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/hr/employees/${employeeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        const data: APIResponse<Employee> = await response.json();

        if (data.success) {
          await fetchEmployees();
        } else {
          setError(data.error || "Erreur lors de la mise à jour");
        }

        return data;
      } catch (err) {
        const errorMsg = "Erreur réseau";
        setError(errorMsg);
        console.error(err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchEmployees]
  );

  /**
   * Archiver un employé (soft delete)
   */
  const archiveEmployee = useCallback(
    async (employeeId: string): Promise<APIResponse<null>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/hr/employees/${employeeId}`, {
          method: "DELETE",
        });

        const data: APIResponse<null> = await response.json();

        if (data.success) {
          await fetchEmployees();
        } else {
          setError(data.error || "Erreur lors de l'archivage");
        }

        return data;
      } catch (err) {
        const errorMsg = "Erreur réseau";
        setError(errorMsg);
        console.error(err);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [fetchEmployees]
  );

  /**
   * Enregistrer une fin de contrat
   */
  const endContract = useCallback(
    async (
      employeeId: string,
      endDate: string,
      reason: "démission" | "fin-periode-essai" | "rupture"
    ): Promise<APIResponse<Employee>> => {
      const endDateObj = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDateObj.setHours(0, 0, 0, 0);

      // Si date future, juste mettre à jour
      if (endDateObj > today) {
        return updateEmployee(employeeId, {
          endDate,
          endContractReason: reason,
        });
      }

      // Si date passée ou aujourd'hui, mettre à jour puis archiver
      const updateResult = await updateEmployee(employeeId, {
        endDate,
        endContractReason: reason,
      });

      if (updateResult.success) {
        await archiveEmployee(employeeId);
      }

      return updateResult;
    },
    [updateEmployee, archiveEmployee]
  );

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    archiveEmployee,
    endContract,
  };
}
