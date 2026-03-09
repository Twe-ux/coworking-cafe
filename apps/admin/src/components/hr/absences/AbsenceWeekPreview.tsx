"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { WeekCard } from "@/components/employee-scheduling/scheduling/WeekCard";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import type { IAffectedShift } from "@/types/absence";

interface AbsenceWeekPreviewProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  employeeId: string | { _id?: string; id?: string };
  affectedShifts: IAffectedShift[];
}

/**
 * Preview week calendar showing affected shifts in orange
 * Similar to old unavailability system
 */
export function AbsenceWeekPreview({
  startDate,
  endDate,
  employeeId,
  affectedShifts,
}: AbsenceWeekPreviewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [virtualShifts, setVirtualShifts] = useState<Shift[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Extract employee ID string
        const empId = typeof employeeId === "string"
          ? employeeId
          : (employeeId._id || employeeId.id || "");

        // Fetch employees
        const response = await fetch("/api/hr/employees?status=active");
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur");
        }

        // Filter out admin account
        const employeesList: Employee[] = (result.data || []).filter(
          (emp: Employee) => emp.firstName.toLowerCase() !== "admin"
        );
        setEmployees(employeesList);

        console.log("📋 [AbsenceWeekPreview] Employees loaded:", employeesList.length);
        console.log("👤 [AbsenceWeekPreview] Sample employee availability:",
          employeesList[0]?.availability ? "✅ Present" : "❌ Missing");

        // Calculate week boundaries from first affected shift
        const monday = getWeekStart(startDate);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        setWeekStart(monday);
        setWeekEnd(sunday);

        console.log("📅 [AbsenceWeekPreview] Week:",
          monday.toISOString().split('T')[0],
          "to",
          sunday.toISOString().split('T')[0]);
        console.log("🎯 [AbsenceWeekPreview] Target employee ID:", empId);
        console.log("📆 [AbsenceWeekPreview] Absence period:", startDate, "to", endDate);

        // Convert employee availabilities to virtual shifts for display
        const shifts: Shift[] = [];

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(monday);
          currentDate.setDate(currentDate.getDate() + i);
          const dateStr = currentDate.toISOString().split("T")[0];

          employeesList.forEach((employee) => {
            const dayKey = getDayKey(currentDate);
            const dayAvailability = employee.availability?.[dayKey];
            const slots = dayAvailability?.slots || [];

            // Check if this date is in the absence period AND this is the requesting employee
            const isRequestedAbsence =
              dateStr >= startDate &&
              dateStr <= endDate &&
              employee.id === empId;

            // Debug first employee on first day
            if (i === 0 && employee === employeesList[0]) {
              console.log(`🔍 [Day ${dateStr}] Employee:`, employee.firstName, employee.lastName);
              console.log(`🔍 [Day ${dateStr}] Day key:`, dayKey);
              console.log(`🔍 [Day ${dateStr}] Availability:`, employee.availability);
              console.log(`🔍 [Day ${dateStr}] Day availability:`, dayAvailability);
              console.log(`🔍 [Day ${dateStr}] Slots:`, slots);
            }

            slots.forEach((slot, idx) => {
              shifts.push({
                _id: `${employee.id}-${dateStr}-${idx}`,
                id: `${employee.id}-${dateStr}-${idx}`,
                employeeId: employee.id,
                date: currentDate,
                startTime: slot.start,
                endTime: slot.end,
                type: slot.start < "14:30" ? "morning" : "afternoon",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Mark as absence requested if this is the requesting employee during absence period
                ...(isRequestedAbsence && { _unavailabilityRequested: true }),
              } as any);
            });
          });
        }

        console.log("✨ [AbsenceWeekPreview] Total shifts created:", shifts.length);
        console.log("🟠 [AbsenceWeekPreview] Orange shifts (absence):",
          shifts.filter(s => (s as any)._unavailabilityRequested).length);

        setVirtualShifts(shifts);
      } catch (err) {
        console.error("Error loading absence preview:", err);
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [startDate, endDate, employeeId, affectedShifts]);

  // Get week start (Monday)
  function getWeekStart(dateStr: string): Date {
    // Parse date as local time, not UTC to avoid timezone issues
    // Input format: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, adjust to Monday
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // Get day key for availability (monday, tuesday, wednesday, etc.)
  function getDayKey(date: Date): string {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
  }

  // Position shifts by employee for WeekCard
  function getShiftsPositionedByEmployee(date: Date) {
    const dateStr = date.toISOString().split("T")[0];
    const dayShifts = virtualShifts.filter((shift) => {
      const shiftDateStr = new Date(shift.date).toISOString().split("T")[0];
      return shiftDateStr === dateStr;
    });

    return employees.map((employee) => {
      const employeeShifts = dayShifts.filter(
        (shift) => shift.employeeId === employee.id
      );

      return {
        employee,
        morningShifts: employeeShifts.filter((s) => s.type === "morning"),
        afternoonShifts: employeeShifts.filter((s) => s.type === "afternoon"),
      };
    });
  }

  // Calculate weekly hours (simplified)
  function calculateWeeklyHours(
    empId: string,
    weekStart: Date,
    weekEnd: Date
  ): number {
    // Not needed for absence preview, return 0
    return 0;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <WeekCard
        week={{
          weekStart,
          weekEnd,
          weekNumber: 0,
        }}
        employees={employees}
        getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
        calculateWeeklyHours={calculateWeeklyHours}
        showHours={false}
        showViewAllButton={false}
      />
    </div>
  );
}
