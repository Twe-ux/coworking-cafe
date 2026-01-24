"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { Badge } from "@/components/ui/badge";
import type {
  Employee,
  TimeSlot,
  AvailabilityDay,
  WeeklyAvailability,
} from "@/types/hr";

// Availability flattened for display
interface AvailabilitySlot {
  employeeId: string;
  employee: Employee;
  dayOfWeek: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  startTime: string;
  endTime: string;
}

export function AvailabilityCalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active employees with availabilities
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        // Filtrer pour masquer le compte Admin Dev (compte technique pour tests)
        const filteredEmployees = (result.data || []).filter(
          (emp: Employee) => {
            return (
              emp.email !== "dev@coworkingcafe.com" &&
              !(emp.firstName === "Admin" && emp.lastName === "Dev")
            );
          },
        );
        setEmployees(filteredEmployees);
      } else {
        console.error("Error fetching employees:", result.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Flatten employee availabilities to individual slots
  const availabilitySlots = useMemo(() => {
    const slots: AvailabilitySlot[] = [];

    const dayMapping: Array<keyof WeeklyAvailability> = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    employees.forEach((employee) => {
      if (!employee.availability) return;

      dayMapping.forEach((dayName, dayIndex) => {
        const dayAvailability = employee.availability?.[dayName];
        if (!dayAvailability || !dayAvailability.available) return;

        dayAvailability.slots.forEach((slot) => {
          slots.push({
            employeeId: employee.id,
            employee,
            dayOfWeek: dayIndex, // 0=Monday, 1=Tuesday, ..., 6=Sunday
            startTime: slot.start,
            endTime: slot.end,
          });
        });
      });
    });

    return slots;
  }, [employees]);

  // Convert availability slots to calendar dates
  const availabilityDates = useMemo(() => {
    const dates: Array<{
      date: Date;
      slot: AvailabilitySlot;
    }> = [];

    // Get all days in current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // For each availability slot, create entries for all matching dates in the month
    availabilitySlots.forEach((slot) => {
      const date = new Date(firstDay);
      while (date <= lastDay) {
        // Check if this date's day of week matches the availability
        // JavaScript: 0=Sunday, 1=Monday, etc.
        // Our availability: 0=Monday, 1=Tuesday, ..., 6=Sunday
        const jsDay = date.getDay(); // 0-6 (Sunday-Saturday)
        const ourDay = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0-6 (Monday-Sunday)

        if (ourDay === slot.dayOfWeek) {
          dates.push({
            date: new Date(date),
            slot,
          });
        }

        date.setDate(date.getDate() + 1);
      }
    });

    return dates;
  }, [availabilitySlots, currentDate]);

  // Get availability slots for a specific employee on a specific date
  const getAvailabilitiesForDate = (date: Date, employeeId: string) => {
    const dateStr = date.toDateString();
    return availabilityDates.filter(
      (avDate) =>
        avDate.date.toDateString() === dateStr &&
        avDate.slot.employeeId === employeeId,
    );
  };

  // Utility: Determine if slot starts before 14:30 (morning)
  const isSlotBeforeCutoff = (startTime: string): boolean => {
    if (!startTime || typeof startTime !== "string") return false;

    const timeParts = startTime.split(":");
    if (timeParts.length !== 2) return false;

    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;

    const startTimeInMinutes = hours * 60 + minutes;
    const cutoffTime = 14 * 60 + 30; // 14h30 in minutes
    return startTimeInMinutes < cutoffTime;
  };

  const renderCell = (date: Date) => {
    return (
      <div className="flex-1 space-y-1 overflow-hidden">
        {employees.map((employee) => {
          const dayAvailabilities = getAvailabilitiesForDate(date, employee.id);

          // Split slots by morning/afternoon
          const morningSlots = dayAvailabilities.filter((avDate) =>
            isSlotBeforeCutoff(avDate.slot.startTime),
          );
          const afternoonSlots = dayAvailabilities.filter(
            (avDate) => !isSlotBeforeCutoff(avDate.slot.startTime),
          );

          return (
            <div key={employee.id} className="grid min-h-4 grid-cols-2 gap-1">
              {/* Morning column (before 14:30) */}
              <div className="space-y-1 text-center">
                {morningSlots.length > 0 ? (
                  morningSlots.map((avDate, idx) => (
                    <div
                      key={`${employee.id}-morning-${idx}`}
                      className="rounded px-1 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: employee.color || "#9CA3AF" }}
                      title={`${employee.firstName} - ${avDate.slot.startTime} à ${avDate.slot.endTime}`}
                    >
                      {avDate.slot.startTime}-{avDate.slot.endTime}
                    </div>
                  ))
                ) : (
                  <div className="h-5 py-0.5"></div>
                )}
              </div>

              {/* Afternoon column (after 14:30) */}
              <div className="space-y-1 text-center">
                {afternoonSlots.length > 0 ? (
                  afternoonSlots.map((avDate, idx) => (
                    <div
                      key={`${employee.id}-afternoon-${idx}`}
                      className="rounded px-1 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: employee.color || "#9CA3AF" }}
                      title={`${employee.firstName} - ${avDate.slot.startTime} à ${avDate.slot.endTime}`}
                    >
                      {avDate.slot.startTime}-{avDate.slot.endTime}
                    </div>
                  ))
                ) : (
                  <div className="h-5 py-0.5"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSidebarWeek = () => {
    return (
      <>
        {/* Spacer pour aligner avec le numéro de jour */}
        <div className="mb-1 h-6"></div>
        {/* Liste des employés */}
        <div className="flex-1 space-y-1 overflow-hidden">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="flex h-5 items-center rounded px-1 text-xs font-medium text-white"
              style={{ backgroundColor: employee.color || "#9CA3AF" }}
              title={employee.fullName}
            >
              <span className="flex-1 truncate text-[10px]">
                {employee.firstName}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h2 className="text-2xl font-bold">Disponibilités mensuelles</h2>
        <p className="text-sm text-muted-foreground">
          Visualisez les créneaux de disponibilité de vos employés
        </p>
      </div> */}

      {/* Calendar */}
      {isLoading ? (
        <div className="flex h-[600px] items-center justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : (
        <MonthlyCalendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          data={availabilityDates}
          getDateForData={(item) => item.date}
          renderCell={renderCell}
          renderSidebarWeek={renderSidebarWeek}
          readOnly
          showSidebar
          sidebarTitle="Staff"
          sidebarItems={employees.map((emp) => ({
            id: emp.id,
            label: emp.firstName,
            color: emp.color || "#9CA3AF",
          }))}
          cellHeight={120}
        />
      )}

      {/* Info message */}
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Note :</strong> Ce calendrier affiche les disponibilités
          récurrentes de vos employés. Chaque créneau se répète chaque semaine
          sur le jour correspondant.
        </p>
      </div>
    </div>
  );
}
