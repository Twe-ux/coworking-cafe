"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Employee } from "@/hooks/useEmployees";
import { type Shift } from "@/hooks/useShifts";
import { type TimeEntry } from "@/types/timeEntry";
import { Calendar } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import TimeTrackingCard from "./TimeTrackingCard";

// Types

export interface EmployeeSchedulingProps {
  className?: string;
  employees?: Employee[];
  shifts?: Shift[];
  onAddShift?: (date: Date) => void;
  readOnly?: boolean;
  userRole?: string;
}

// Default employees if none provided
const DEFAULT_EMPLOYEES: Employee[] = [];

// Shift type configurations
const SHIFT_TYPES: Record<
  string,
  { label: string; time: string; color: string }
> = {
  morning: {
    label: "Morning",
    time: "08:00-12:00",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  afternoon: {
    label: "Afternoon",
    time: "12:00-18:00",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  evening: {
    label: "Evening",
    time: "18:00-22:00",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  night: {
    label: "Night",
    time: "22:00-06:00",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function EmployeeScheduling({
  className = "",
  employees: propEmployees = DEFAULT_EMPLOYEES,
  shifts: propShifts = [],
  onAddShift,
  readOnly = false,
  userRole = "",
}: EmployeeSchedulingProps) {
  // Utiliser les employés passés en props ou les employés par défaut
  const employees = propEmployees;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // Utiliser directement les shifts passés en props
  const schedules = propShifts;

  // TimeEntries state
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "pointage">(
    "calendar"
  );

  // Calendar calculations
  const firstDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );

  const lastDayOfMonth = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  );

  const startDateMemo = useMemo(() => {
    const start = new Date(firstDayOfMonth);
    // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - daysToSubtract);
    return start;
  }, [firstDayOfMonth]);

  const calendarDays = useMemo(() => {
    const days = [];
    const current = new Date(startDateMemo);

    // Générer les jours semaine par semaine et arrêter quand on dépasse le mois
    let weeksAdded = 0;
    const maxWeeks = 6; // Limite de sécurité

    while (weeksAdded < maxWeeks) {
      const weekDays = [];

      // Générer 7 jours pour cette semaine
      for (let dayInWeek = 0; dayInWeek < 7; dayInWeek++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Vérifier si cette semaine contient au moins un jour du mois courant
      const hasCurrentMonthDay = weekDays.some(
        (day) =>
          day.getMonth() === currentDate.getMonth() &&
          day.getFullYear() === currentDate.getFullYear()
      );

      if (hasCurrentMonthDay) {
        // Ajouter cette semaine car elle contient au moins un jour du mois
        days.push(...weekDays);
        weeksAdded++;
      } else if (weeksAdded > 0) {
        // Si on a déjà ajouté des semaines et qu'aucun jour de cette semaine
        // n'est dans le mois courant, on s'arrête
        break;
      } else {
        // Si c'est la première semaine et qu'elle ne contient aucun jour du mois,
        // on continue (cas peu probable avec notre calcul de startDateMemo)
        days.push(...weekDays);
        weeksAdded++;
      }
    }

    return days;
  }, [startDateMemo, currentDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fetch TimeEntries for the current month
  const fetchTimeEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      params.append("startDate", startOfMonth.toISOString().split("T")[0]);
      params.append("endDate", endOfMonth.toISOString().split("T")[0]);

      const response = await fetch(`/api/time-entries?${params.toString()}`);
      const timeEntriesData = await response.json();

      if (timeEntriesData.success) {
        interface TimeEntryAPIResponse {
          id: string
          employeeId: string
          date: string
          clockIn: string
          clockOut?: string | null
          status: 'active' | 'completed'
          shiftNumber: 1 | 2
          totalHours?: number
        }

        const entries = (timeEntriesData.data || []).map((entry: TimeEntryAPIResponse) => ({
          ...entry,
          date: new Date(entry.date),
          clockIn: new Date(entry.clockIn),
          clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
        }));
        setTimeEntries(entries);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setTimeEntries([]);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date): Shift[] => {
    // Normaliser les dates avec le timezone français pour cohérence
    const normalizedDate = getFrenchDate(date);

    const filtered = schedules.filter((schedule) => {
      const normalizedScheduleDate = getFrenchDate(schedule.date);
      return (
        normalizedScheduleDate.toDateString() === normalizedDate.toDateString()
      );
    });

    return filtered;
  };

  // Get employee by id
  const getEmployee = (employeeId: string): Employee | undefined => {
    return employees.find((emp) => emp.id === employeeId);
  };

  // Fonction pour déterminer si le créneau commence avant 14h30
  const isShiftBeforeCutoff = (startTime: string) => {
    if (!startTime || typeof startTime !== "string") {
      console.warn("⚠️ Heure de début invalide:", startTime);
      return false;
    }

    const timeParts = startTime.split(":");
    if (timeParts.length !== 2) {
      console.warn("⚠️ Format d'heure invalide:", startTime);
      return false;
    }

    const [hours, minutes] = timeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn("⚠️ Heures ou minutes non numériques:", startTime);
      return false;
    }

    const startTimeInMinutes = hours * 60 + minutes;
    const cutoffTime = 14 * 60 + 30; // 14h30 en minutes
    const isMorning = startTimeInMinutes < cutoffTime;

    return isMorning;
  };

  // Organiser les shifts d'un employé par créneaux matin/après-midi
  const organizeShiftsByTimeSlots = (shifts: Shift[]) => {
    const morning = shifts.filter((shift) =>
      isShiftBeforeCutoff(shift.startTime)
    );
    const afternoon = shifts.filter(
      (shift) => !isShiftBeforeCutoff(shift.startTime)
    );

    return {
      morning,
      afternoon,
    };
  };

  // Organiser les shifts par position d'employé pour une date donnée avec créneaux matin/après-midi
  const getShiftsPositionedByEmployee = (date: Date) => {
    const daySchedules = getSchedulesForDate(date);

    // Créer un tableau avec une position pour chaque employé
    const positionedShifts = employees.map((employee) => {
      const employeeShifts = daySchedules.filter(
        (shift) => shift.employeeId === employee.id
      );
      const organizedShifts = organizeShiftsByTimeSlots(employeeShifts);

      return {
        employee,
        shifts: employeeShifts,
        morningShifts: organizedShifts.morning,
        afternoonShifts: organizedShifts.afternoon,
      };
    });

    return positionedShifts;
  };

  // Fonction utilitaire pour normaliser les dates au timezone français
  const getFrenchDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Date(d.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  };

  // Fonctions spécifiques pour la vue staff par semaines
  const getWeekStart = (date: Date) => {
    // Utiliser la fonction utilitaire pour assurer le timezone français
    const d = getFrenchDate(date);
    const day = d.getDay();
    // Ajuster pour que lundi soit le premier jour de la semaine (1-6, dimanche devient 7)
    const dayAdjusted = day === 0 ? 6 : day - 1;
    const diff = d.getDate() - dayAdjusted;
    const weekStart = new Date(d.setDate(diff));
    // Normaliser à minuit pour éviter les problèmes de comparaison
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const getWeekEnd = (date: Date) => {
    const weekStart = getWeekStart(date);
    return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
  };

  const getWeeksWithShifts = () => {
    // Forcer le timezone français pour la cohérence entre local et production
    const today = getFrenchDate(new Date());
    const currentWeekStart = getWeekStart(today);

    // Calculer la fin après 3 semaines (semaine courante + 2 semaines suivantes)
    const threeWeeksLater = new Date(
      currentWeekStart.getTime() + 3 * 7 * 24 * 60 * 60 * 1000
    );

    // Grouper les shifts par semaine
    const shiftsByWeek = new Map();

    schedules.forEach((shift) => {
      // Assurer que la date du shift utilise aussi le timezone français
      const shiftDate = getFrenchDate(shift.date);
      const shiftWeekStart = getWeekStart(shiftDate);
      const weekKey = shiftWeekStart.getTime();

      // Inclure seulement la semaine courante et les 2 semaines suivantes
      if (
        shiftWeekStart >= currentWeekStart &&
        shiftWeekStart < threeWeeksLater
      ) {
        if (!shiftsByWeek.has(weekKey)) {
          shiftsByWeek.set(weekKey, []);
        }
        shiftsByWeek.get(weekKey).push(shift);
      }
    });

    // Convertir en tableau et trier par date
    return Array.from(shiftsByWeek.entries())
      .map(([weekStartTime, shifts]) => ({
        weekStart: new Date(weekStartTime),
        weekEnd: getWeekEnd(new Date(weekStartTime)),
        shifts: shifts,
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  };

  const getDaysInWeek = (weekStart: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Calculer les heures totales d'un employé pour une semaine donnée
  const calculateWeeklyHours = (
    employeeId: string,
    weekStart: Date,
    weekEnd: Date
  ) => {
    const employeeShifts = schedules.filter((shift) => {
      if (shift.employeeId !== employeeId) return false;

      // Comparer seulement les dates (pas l'heure) pour éviter les problèmes de timezone
      const shiftDateObj = new Date(shift.date);
      const shiftDate = new Date(
        shiftDateObj.getFullYear(),
        shiftDateObj.getMonth(),
        shiftDateObj.getDate()
      );
      const startDate = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate()
      );
      const endDate = new Date(
        weekEnd.getFullYear(),
        weekEnd.getMonth(),
        weekEnd.getDate()
      );

      return shiftDate >= startDate && shiftDate <= endDate;
    });

    return employeeShifts.reduce((totalHours, shift) => {
      const start = new Date(`2000-01-01 ${shift.startTime}`);
      let end = new Date(`2000-01-01 ${shift.endTime}`);

      // Gérer les shifts de nuit qui se terminent le jour suivant
      if (shift.type === "night" && end <= start) {
        end.setDate(end.getDate() + 1);
      }

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return totalHours + Math.max(0, hours);
    }, 0);
  };

  // Convertir les heures décimales en format HH:MM
  const formatHoursToHHMM = (decimalHours: number) => {
    if (decimalHours <= 0) return "";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    // Gérer le cas où les minutes arrondies atteignent 60
    if (minutes === 60) {
      return `${String(hours + 1).padStart(2, "0")}:00`;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Vue spéciale pour le staff - uniquement les semaines avec shifts
  if (userRole === "staff") {
    const weeksWithShifts = getWeeksWithShifts();

    if (weeksWithShifts.length === 0) {
      return (
        <div className={`space-y-6 ${className}`}>
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucun créneau planifié
            </h3>
            <p className="text-gray-600">
              Vous n&apos;avez aucun créneau de travail programmé pour les
              semaines à venir.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-6 ${className}`}>
        <CardContent className="pt-0">
          {/* Time Tracking View */}
          <div className="space-y-6">
            {/* Time Tracking Cards */}
            <div>
              <h3 className="mb-4 text-lg font-medium">
                Pointage des Employés
              </h3>
              <div
                className={`grid gap-4 ${
                  employees.length >= 5
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                    : employees.length === 4
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    : employees.length <= 3 &&
                      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {employees.map((employee) => (
                  <TimeTrackingCard
                    key={employee.id}
                    employee={employee}
                    onStatusChange={() => {
                      // Refresh data when status changes
                      // This could trigger a re-fetch of time entries
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Time Entries List */}
            {/* <div>
              <TimeEntriesList employees={employees} />
            </div> */}
          </div>
        </CardContent>
        {/* Header Staff */}
        <div className="">
          <h1 className="text-2xl font-bold text-gray-900">Mon Planning</h1>
          <p className="mt-1 text-gray-600">
            Vos créneaux de travail par semaine
          </p>
        </div>

        {/* Semaines avec créneaux */}
        <div className="space-y-3">
          {weeksWithShifts.map((week, weekIndex) => {
            const daysInWeek = getDaysInWeek(week.weekStart);

            return (
              <Card key={weekIndex}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    Semaine du{" "}
                    {week.weekStart.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    au{" "}
                    {week.weekEnd.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {/* Colonne Staff séparée */}
                    <div className="w-32 flex-shrink-0">
                      {/* En-tête Staff */}
                      <div className="flex min-h-[40px] items-center justify-center rounded-t-lg border border-gray-400 bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
                        Staff
                      </div>

                      {/* Case Staff pour la semaine */}
                      <div className="flex min-h-[120px] flex-col rounded-b-lg border-r border-b border-l border-gray-400 bg-gray-50 p-2">
                        <div className="h-6"></div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {employees.map((employee, employeeIndex) => {
                            const weeklyHours = calculateWeeklyHours(
                              employee.id,
                              week.weekStart,
                              week.weekEnd
                            );

                            return (
                              <div
                                key={employee.id}
                                className="rounded text-xs font-medium text-white flex h-5 items-center justify-between px-1"
                                style={{
                                  backgroundColor: employee.color || "#9CA3AF",
                                }}
                              >
                                <span className="flex-1 truncate">
                                  {employee.firstName}
                                </span>
                                <span className="ml-1 text-xs opacity-90">
                                  {formatHoursToHHMM(weeklyHours)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Calendrier principal */}
                    <div className="flex-1 rounded-lg border border-gray-400">
                      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-gray-400">
                        {/* En-têtes des jours */}
                        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                          (day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className="flex min-h-[40px] items-center justify-center bg-gray-50 p-2 text-center text-sm font-medium text-gray-600"
                            >
                              {day}
                            </div>
                          )
                        )}

                        {/* Jours de la semaine */}
                        {daysInWeek.map((day, dayIndex) => {
                          const positionedShifts =
                            getShiftsPositionedByEmployee(day);
                          const isToday =
                            day.toDateString() === new Date().toDateString();

                          return (
                            <div
                              key={dayIndex}
                              className={`flex min-h-[120px] flex-col bg-white p-2 ${
                                isToday ? "ring-2 ring-blue-500 ring-inset" : ""
                              } cursor-pointer transition-colors hover:bg-gray-50`}
                            >
                              <div
                                className={`mb-1 text-sm font-medium ${
                                  isToday ? "text-blue-600" : "text-gray-900"
                                }`}
                              >
                                {day.getDate()}
                              </div>
                              <div className="flex-1 space-y-1 overflow-hidden">
                                {employees.map((employee) => {
                                  // Trouver les shifts de cet employé pour cette date
                                  const employeeShifts = positionedShifts.find(
                                    (ps) => ps.employee.id === employee.id
                                  );
                                  const morningShifts = employeeShifts
                                    ? employeeShifts.morningShifts
                                    : [];
                                  const afternoonShifts = employeeShifts
                                    ? employeeShifts.afternoonShifts
                                    : [];

                                  return (
                                    <div
                                      key={employee.id}
                                      className="grid min-h-4 grid-cols-2 gap-2"
                                    >
                                      {/* Colonne matin (avant 14h30) */}
                                      <div className="space-y-1 text-center">
                                        {morningShifts.length > 0 ? (
                                          morningShifts.map((shift) => (
                                            <div
                                              key={shift.id}
                                              className="rounded px-1 py-0.5 text-xs font-medium text-white"
                                              style={{
                                                backgroundColor:
                                                  employee.color || "#9CA3AF",
                                              }}
                                              title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                                            >
                                              {shift.startTime}-{shift.endTime}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="h-5 py-0.5"></div>
                                        )}
                                      </div>

                                      {/* Colonne après-midi (après 14h30) */}
                                      <div className="space-y-1 text-center">
                                        {afternoonShifts.length > 0 ? (
                                          afternoonShifts.map((shift) => (
                                            <div
                                              key={shift.id}
                                              className="rounded px-1 py-0.5 text-xs font-medium text-white"
                                              style={{
                                                backgroundColor:
                                                  employee.color || "#9CA3AF",
                                              }}
                                              title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                                            >
                                              {shift.startTime}-{shift.endTime}
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Ce composant est uniquement pour le staff
  // Si on arrive ici, c'est une erreur de configuration
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="py-12 text-center">
        <p className="text-gray-600">
          Ce composant est réservé au personnel (staff).
        </p>
      </div>
    </div>
  );
}
