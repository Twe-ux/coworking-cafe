"use client";

import EmployeeScheduling from "@/components/employee-scheduling/EmployeeScheduling";
import { useEmployees } from "@/hooks/useEmployees";
import { useShifts } from "@/hooks/useShifts";
import { useUnavailabilities } from "@/hooks/useUnavailabilities";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { PlanningPageSkeleton } from "./PlanningPageSkeleton";

export default function StaffSchedulePage() {
  const { data: session } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate date range: current week +/- 2 weeks (4 weeks total)
  // This limits the amount of data loaded for better performance
  const dateRange = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 14); // 2 weeks before

    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 14); // 2 weeks after

    return {
      startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0],     // YYYY-MM-DD
    };
  }, []);

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
  } = useShifts({
    active: true,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Charger les indisponibilités approuvées (pour affichage dans planning)
  const { unavailabilities, loading: unavailabilitiesLoading } = useUnavailabilities({
    status: "approved",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Debug: Log unavailabilities data
  console.log('[Planning] Date range:', dateRange);
  console.log('[Planning] Unavailabilities loaded:', unavailabilities.length);
  console.log('[Planning] Unavailabilities:', unavailabilities);

  // Gérer les états de chargement et d'erreur
  if (employeesLoading || shiftsLoading || unavailabilitiesLoading) {
    return <PlanningPageSkeleton />;
  }

  if (employeesError || shiftsError) {
    return (
      <div className="space-y-6 ">
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

  // Get current user's employee from email match
  const currentEmployee = employees.find(
    (emp) => emp.email === session?.user?.email,
  );

  return (
    <div className="space-y-6">
      {/* Planning */}
      <EmployeeScheduling
        key={refreshKey}
        employees={employees}
        shifts={shifts}
        unavailabilities={unavailabilities}
        readOnly={true}
        userRole="staff"
      />
    </div>
  );
}
