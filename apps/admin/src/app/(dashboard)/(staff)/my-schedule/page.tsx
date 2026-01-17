"use client";

import EmployeeScheduling from "@/components/employee-scheduling/EmployeeScheduling";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useEmployees } from "@/hooks/useEmployees";
import { useShifts } from "@/hooks/useShifts";

export default function StaffSchedulePage() {
  // Charger les employés et shifts depuis l'API
  const {
    employees,
    isLoading: employeesLoading,
    error: employeesError,
  } = useEmployees({ active: true });

  const {
    shifts,
    isLoading: shiftsLoading,
    error: shiftsError,
  } = useShifts({ active: true });

  // Gérer les états de chargement et d'erreur
  if (employeesLoading || shiftsLoading) {
    return <LoadingSkeleton variant="card" count={4} />;
  }

  if (employeesError || shiftsError) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <p className="font-medium">Erreur lors du chargement des données</p>
          {employeesError && (
            <p className="text-sm">Employés: {employeesError}</p>
          )}
          {shiftsError && <p className="text-sm">Créneaux: {shiftsError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Planning uniquement pour le staff - afficher tous les employés et tous les créneaux */}
      <EmployeeScheduling
        employees={employees}
        shifts={shifts}
        readOnly={true}
        userRole="staff"
      />
    </div>
  );
}
