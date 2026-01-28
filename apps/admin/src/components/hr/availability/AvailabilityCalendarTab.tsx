"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MonthlyCalendar } from "@/components/shared/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarOff } from "lucide-react";
import { CreateUnavailabilityModal } from "../unavailability/CreateUnavailabilityModal";
import type { CreateUnavailabilityData } from "../unavailability/CreateUnavailabilityModal";
import { UnavailabilityDetailsModal } from "../unavailability/UnavailabilityDetailsModal";
import { useUnavailabilities } from "@/hooks/useUnavailabilities";
import {
  getMonthBoundaries,
  getAllDatesInMonth,
  getDayOfWeek,
  isDateInRange,
  dateToString,
} from "@/lib/utils/format-date";
import type {
  Employee,
  TimeSlot,
  AvailabilityDay,
  WeeklyAvailability,
} from "@/types/hr";
import type { IUnavailabilityWithEmployee } from "@/types/unavailability";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUnavailability, setSelectedUnavailability] = useState<IUnavailabilityWithEmployee | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Get month boundaries for unavailabilities (using strings to avoid timezone issues)
  const { monthStart, monthEnd } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const { start, end } = getMonthBoundaries(year, month);
    return { monthStart: start, monthEnd: end };
  }, [currentDate]);

  // Fetch unavailabilities for current month
  const { unavailabilities, createUnavailability, updateUnavailability, deleteUnavailability } = useUnavailabilities({
    startDate: monthStart,
    endDate: monthEnd,
    status: 'approved',
  });

  // Fetch active employees with availabilities
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/hr/employees?status=active");
      const result = await response.json();

      if (result.success) {
        // Filtrer pour masquer l'employé dev
        const filteredEmployees = (result.data || []).filter(
          (emp: Employee) => {
            return !emp.email.toLowerCase().includes("dev@") &&
                   emp.email !== "dev@coworkingcafe.com";
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

  // Convert availability slots to calendar dates (using strings to avoid timezone issues)
  const availabilityDates = useMemo(() => {
    const dates: Array<{
      date: Date; // Keep Date for MonthlyCalendar component compatibility
      dateStr: string; // Add string version for logic
      slot: AvailabilitySlot;
    }> = [];

    // Get all dates in current month as strings
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const allDates = getAllDatesInMonth(year, month);

    // For each availability slot, create entries for all matching dates in the month
    availabilitySlots.forEach((slot) => {
      allDates.forEach((dateStr) => {
        const dayOfWeek = getDayOfWeek(dateStr);

        if (dayOfWeek === slot.dayOfWeek) {
          dates.push({
            date: new Date(dateStr + 'T12:00:00'), // For calendar component (with noon to avoid timezone)
            dateStr, // For logic
            slot,
          });
        }
      });
    });

    return dates;
  }, [availabilitySlots, currentDate]);

  // Get availability slots for a specific employee on a specific date
  const getAvailabilitiesForDate = (dateStr: string, employeeId: string) => {
    return availabilityDates.filter(
      (avDate) =>
        avDate.dateStr === dateStr &&
        avDate.slot.employeeId === employeeId,
    );
  };

  // Check if employee is unavailable on a specific date (using strings to avoid timezone issues)
  const isEmployeeUnavailable = (dateStr: string, employeeId: string): boolean => {
    return unavailabilities.some((unavail) => {
      return (
        unavail.employeeId === employeeId &&
        isDateInRange(dateStr, unavail.startDate, unavail.endDate)
      );
    });
  };

  // Handler: Open details modal for unavailability (using strings to avoid timezone issues)
  const handleUnavailabilityClick = (dateStr: string, employeeId: string) => {
    const unavail = unavailabilities.find((u) =>
      u.employeeId === employeeId &&
      isDateInRange(dateStr, u.startDate, u.endDate)
    );

    if (unavail) {
      setSelectedUnavailability(unavail);
      setIsDetailsModalOpen(true);
    }
  };

  // Handler: Edit unavailability
  const handleEdit = (unavailability: IUnavailabilityWithEmployee) => {
    setSelectedUnavailability(unavailability);
    setEditMode(true);
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  // Handler: Delete unavailability
  const handleDelete = async (id: string) => {
    await deleteUnavailability(id);
    setIsDetailsModalOpen(false);
    setSelectedUnavailability(null);
  };

  // Handler: Create or Update unavailability
  const handleCreateOrUpdate = async (data: CreateUnavailabilityData) => {
    if (editMode && selectedUnavailability) {
      await updateUnavailability(selectedUnavailability._id, data);
      setEditMode(false);
      setSelectedUnavailability(null);
    } else {
      await createUnavailability(data);
    }
    setIsModalOpen(false);
  };

  // Handler: Close create modal
  const handleCloseCreateModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setSelectedUnavailability(null);
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
    // Convert Date to string immediately to avoid timezone issues
    const dateStr = dateToString(date);

    return (
      <div className="flex-1 space-y-1 overflow-hidden">
        {employees.map((employee) => {
          const isUnavailable = isEmployeeUnavailable(dateStr, employee.id);

          // If unavailable, show red "INDISPO" instead of availabilities
          if (isUnavailable) {
            return (
              <div key={employee.id} className="grid min-h-4 grid-cols-1">
                <div
                  className="cursor-pointer rounded bg-red-600 px-1 py-0.5 text-center text-xs font-bold text-white hover:bg-red-700"
                  onClick={() => handleUnavailabilityClick(dateStr, employee.id)}
                  title="Cliquez pour voir les détails"
                >
                  INDISPO
                </div>
              </div>
            );
          }

          const dayAvailabilities = getAvailabilitiesForDate(dateStr, employee.id);

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
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Disponibilités mensuelles</h2>
          <p className="text-sm text-muted-foreground">
            Visualisez les créneaux de disponibilité de vos employés
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <CalendarOff className="mr-2 h-4 w-4" />
          Créer une indisponibilité
        </Button>
      </div>

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
          sur le jour correspondant. Les indisponibilités (congés, maladie, etc.)
          sont affichées en rouge.
        </p>
      </div>

      {/* Create/Edit Unavailability Modal */}
      <CreateUnavailabilityModal
        isOpen={isModalOpen}
        employees={employees}
        onClose={handleCloseCreateModal}
        onCreate={handleCreateOrUpdate}
        editData={
          editMode && selectedUnavailability
            ? {
                id: selectedUnavailability._id,
                employeeId: selectedUnavailability.employeeId,
                startDate: selectedUnavailability.startDate,
                endDate: selectedUnavailability.endDate,
                type: selectedUnavailability.type,
                reason: selectedUnavailability.reason,
              }
            : undefined
        }
      />

      {/* Unavailability Details Modal */}
      {selectedUnavailability && (
        <UnavailabilityDetailsModal
          isOpen={isDetailsModalOpen}
          unavailability={selectedUnavailability}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedUnavailability(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
