"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Shift } from "@/types/shift";
import { type TimeEntry } from "@/types/timeEntry";
import { type Employee } from "@/types/hr";
import { Calendar, Clock, Target } from "lucide-react";
import { useMemo } from "react";

interface EmployeeMonthlyCardProps {
  employees: Employee[];
  shifts: Shift[];
  timeEntries?: TimeEntry[];
  currentDate: Date;
  className?: string;
  showStats?: boolean;
}

interface EmployeeStats {
  employee: Employee;
  plannedHours: number;
  actualHours: number;
  projectedHours: number;
}

export default function EmployeeMonthlyCard({
  employees,
  shifts,
  timeEntries = [],
  currentDate,
  className = "",
  showStats = false,
}: EmployeeMonthlyCardProps) {
  const formatDateToYMD = (date: Date | string): string => {
    if (typeof date === "string") {
      return date.split("T")[0];
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { firstDayStr, lastDayStr } = useMemo(() => {
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    return {
      firstDayStr: formatDateToYMD(firstDay),
      lastDayStr: formatDateToYMD(lastDay),
    };
  }, [currentDate]);

  const formatHoursToHHMM = (decimalHours: number): string => {
    if (decimalHours <= 0) return "0:00";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    if (minutes === 60) {
      return `${String(hours + 1).padStart(2, "0")}:00`;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  };

  const calculateShiftHours = (shift: Shift): number => {
    const start = new Date(`2000-01-01 ${shift.startTime}`);
    let end = new Date(`2000-01-01 ${shift.endTime}`);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours);
  };

  const employeeMonthlyStats = useMemo(() => {
    const today = new Date();
    const todayStr = formatDateToYMD(today);

    return employees.map((employee): EmployeeStats => {
      const monthlyShifts = shifts.filter((shift) => {
        if (shift.employeeId !== employee.id || !shift.isActive) {
          return false;
        }

        const shiftDateStr = formatDateToYMD(shift.date);
        return shiftDateStr >= firstDayStr && shiftDateStr <= lastDayStr;
      });

      const plannedHours = monthlyShifts.reduce((total, shift) => {
        return total + calculateShiftHours(shift);
      }, 0);

      let actualHours = 0;
      const completedShiftIds = new Set<string>();

      if (Array.isArray(timeEntries)) {
        for (const entry of timeEntries) {
          if (
            entry.employeeId === employee.id &&
            entry.status === "completed" &&
            entry.clockOut
          ) {
            const entryDateStr = formatDateToYMD(entry.date);

            if (
              entryDateStr >= firstDayStr &&
              entryDateStr <= todayStr &&
              entryDateStr <= lastDayStr
            ) {
              actualHours += entry.totalHours || 0;
              const shiftId = `${entryDateStr}-${entry.shiftNumber || 1}`;
              completedShiftIds.add(shiftId);
            }
          }
        }
      }

      const remainingPlannedHours = monthlyShifts
        .filter((shift) => {
          const shiftDateStr = formatDateToYMD(shift.date);
          const shiftId = `${shiftDateStr}-1`;
          const isCompleted = completedShiftIds.has(shiftId);

          if (shiftDateStr === todayStr) {
            return !isCompleted;
          } else {
            return shiftDateStr > todayStr;
          }
        })
        .reduce((total, shift) => {
          return total + calculateShiftHours(shift);
        }, 0);

      const projectedHours = actualHours + remainingPlannedHours;

      return {
        employee,
        plannedHours,
        actualHours,
        projectedHours,
      };
    });
  }, [employees, shifts, timeEntries, firstDayStr, lastDayStr]);

  const getHoursColorClass = (hours: number): string => {
    if (hours >= 140) return "text-red-600 bg-red-50 border-red-200";
    if (hours >= 100) return "text-orange-600 bg-orange-50 border-orange-200";
    if (hours >= 60) return "text-green-600 bg-green-50 border-green-200";
    if (hours > 0) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const monthName = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-6 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Statistiques mensuelles - {monthName}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employeeMonthlyStats.map(
          ({ employee, plannedHours, actualHours, projectedHours }) => (
            <Card
              key={employee.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: employee.color || "#9CA3AF" }}
                  />
                  <div className="min-w-0 flex gap-4">
                    <CardTitle className="truncate text-base font-medium">
                      {employee.firstName} {employee.lastName}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {employee.employeeRole}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Heures planifiées
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-sm ${getHoursColorClass(
                      plannedHours,
                    )}`}
                  >
                    {formatHoursToHHMM(plannedHours)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Heures réalisées
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-sm ${getHoursColorClass(
                      actualHours,
                    )}`}
                  >
                    {formatHoursToHHMM(actualHours)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Heures projetées
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-mono text-sm ${getHoursColorClass(
                      projectedHours,
                    )}`}
                  >
                    {formatHoursToHHMM(projectedHours)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {employeeMonthlyStats.length === 0 && (
        <div className="py-8 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Aucun employé trouvé
          </h3>
          <p className="text-gray-600">
            Ajoutez des employés pour voir leurs statistiques mensuelles.
          </p>
        </div>
      )}

      {showStats && employeeMonthlyStats.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Vue d'ensemble mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {employeeMonthlyStats.length}
                </div>
                <div className="text-sm text-gray-600">Employés actifs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatHoursToHHMM(
                    employeeMonthlyStats.reduce(
                      (sum, stat) => sum + stat.plannedHours,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-gray-600">Total planifié</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatHoursToHHMM(
                    employeeMonthlyStats.reduce(
                      (sum, stat) => sum + stat.actualHours,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-gray-600">Total réalisé</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatHoursToHHMM(
                    employeeMonthlyStats.reduce(
                      (sum, stat) => sum + stat.projectedHours,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-gray-600">Total projeté</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
