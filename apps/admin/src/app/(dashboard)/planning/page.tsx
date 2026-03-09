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

  // Get user role from session
  const userRole = (session?.user as any)?.role || 'staff';
  const isStaff = userRole === 'staff';

  // Calculate date range: current week +/- 2 weeks, rounded to full weeks (Monday-Sunday)
  // This ensures we always display complete weeks, even if they extend beyond the 2-week window
  const dateRange = useMemo(() => {
    const now = new Date();

    // Calculate 2 weeks before
    const twoWeeksBefore = new Date(now);
    twoWeeksBefore.setDate(now.getDate() - 14);

    // Round DOWN to the Monday of that week
    const startDate = new Date(twoWeeksBefore);
    const startDayOfWeek = startDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const daysToMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // If Sunday, go back 6 days
    startDate.setDate(startDate.getDate() - daysToMonday);

    // Calculate 2 weeks after
    const twoWeeksAfter = new Date(now);
    twoWeeksAfter.setDate(now.getDate() + 14);

    // Round UP to the Sunday of that week
    const endDate = new Date(twoWeeksAfter);
    const endDayOfWeek = endDate.getDay();
    const daysToSunday = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek; // If already Sunday, keep it; else go forward to Sunday
    endDate.setDate(endDate.getDate() + daysToSunday);

    // Format as YYYY-MM-DD using local timezone
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
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
        unavailabilities={isStaff ? [] : unavailabilities}
        readOnly={true}
        userRole={userRole}
      />
    </div>
  );
}
