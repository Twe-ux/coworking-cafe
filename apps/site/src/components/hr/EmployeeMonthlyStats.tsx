"use client";

import { calculateDuration } from "@/lib/utils/planning";
import { Icon } from "@iconify/react";
import { Card, Col, Row } from "react-bootstrap";

// Types
interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole?: string;
  contractualHours?: number;
  employeeColor?: string;
}

interface Shift {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeRole: string;
  } | string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TimeEntry {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | string;
  date: string;
  totalHours?: number;
}

interface EmployeeMonthlyStatsProps {
  employees: Employee[];
  shifts: Shift[];
  timeEntries?: TimeEntry[];
  currentDate: Date;
}

// Color palette for employees (same as calendar)
const EMPLOYEE_COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F97316", // Orange
];

export default function EmployeeMonthlyStats({
  employees,
  shifts,
  timeEntries = [],
  currentDate,
}: EmployeeMonthlyStatsProps) {
  // Get employee color
  const getEmployeeColor = (employeeId: string) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    if (employee?.employeeColor) {
      return employee.employeeColor;
    }
    const index = employees.findIndex((emp) => emp._id === employeeId);
    return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
  };

  // Format month/year for title
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  // Calculate monthly contractual hours (weekly hours × 4.33)
  const calculateContractualMonthlyHours = (weeklyHours?: number) => {
    if (!weeklyHours) return null;
    const totalMinutes = Math.round(weeklyHours * 4.33 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Get all shifts for an employee in the current month
  const getEmployeeMonthShifts = (employeeId: string) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return shifts.filter((shift) => {
      const shiftEmpId = typeof shift.employeeId === 'string' ? shift.employeeId : shift.employeeId._id;
      if (shiftEmpId !== employeeId) return false;

      // Parse shift date and compare year/month/day only
      const shiftDate = new Date(shift.date);
      const shiftYear = shiftDate.getFullYear();
      const shiftMonth = shiftDate.getMonth();

      return shiftYear === year && shiftMonth === month;
    });
  };

  // Get all time entries for an employee in the current month
  const getEmployeeMonthTimeEntries = (employeeId: string) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return timeEntries.filter((entry) => {
      const entryEmpId = typeof entry.employeeId === 'string' ? entry.employeeId : entry.employeeId._id;
      if (entryEmpId !== employeeId) return false;

      // Parse entry date and compare year/month only
      const entryDate = new Date(entry.date);
      const entryYear = entryDate.getFullYear();
      const entryMonth = entryDate.getMonth();

      return entryYear === year && entryMonth === month;
    });
  };

  // Calculate planned hours for the entire month
  const calculatePlannedHours = (employeeId: string) => {
    const monthShifts = getEmployeeMonthShifts(employeeId);
    let totalMinutes = 0;

    monthShifts.forEach((shift) => {
      const durationInHours = calculateDuration(shift.startTime, shift.endTime);
      totalMinutes += durationInHours * 60;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Calculate actual hours (from time entries)
  const calculateActualHours = (employeeId: string) => {
    const monthTimeEntries = getEmployeeMonthTimeEntries(employeeId);
    let totalMinutes = 0;

    monthTimeEntries.forEach((entry) => {
      if (entry.totalHours) {
        totalMinutes += entry.totalHours * 60;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Calculate projected hours (actual for past days + planned for future days)
  const calculateProjectedHours = (employeeId: string) => {
    const monthShifts = getEmployeeMonthShifts(employeeId);
    const monthTimeEntries = getEmployeeMonthTimeEntries(employeeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalMinutes = 0;

    // Pour chaque shift du mois
    monthShifts.forEach((shift) => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(0, 0, 0, 0);

      if (shiftDate < today) {
        // Pour les jours passés : utiliser les heures réalisées si elles existent
        const dateStr = shiftDate.toISOString().split("T")[0];
        const entriesForDate = monthTimeEntries.filter((entry) => {
          const entryDateStr = new Date(entry.date).toISOString().split("T")[0];
          return entryDateStr === dateStr;
        });

        // Compter les heures réalisées pour ce jour
        entriesForDate.forEach((entry) => {
          if (entry.totalHours) {
            totalMinutes += entry.totalHours * 60;
          }
        });
      } else {
        // Pour aujourd'hui et le futur : utiliser les heures planifiées
        const durationInHours = calculateDuration(shift.startTime, shift.endTime);
        totalMinutes += durationInHours * 60;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center mb-3">
        <Icon icon="ri:calendar-line" width={24} className="me-2" />
        <h5 className="mb-0 text-capitalize">
          Statistiques Mensuelles - {formatMonthYear()}
        </h5>
      </div>

      <Row className="g-3">
        {employees.map((employee) => {
          const color = getEmployeeColor(employee._id);
          const contractualMonthlyHours = calculateContractualMonthlyHours(
            employee.contractualHours
          );
          const plannedHours = calculatePlannedHours(employee._id);
          const actualHours = calculateActualHours(employee._id);
          const projectedHours = calculateProjectedHours(employee._id);

          return (
            <Col key={employee._id} md={6} lg={4}>
              <Card>
                <Card.Body>
                  {/* Employee Header */}
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: color,
                          marginRight: "8px",
                        }}
                      />
                      <div>
                        <h6 className="mb-0">
                          {employee.firstName} {employee.lastName}
                        </h6>
                        <small className="text-muted">{employee.employeeRole}</small>
                      </div>
                    </div>
                    {contractualMonthlyHours && (
                      <div className="text-end">
                        <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>
                          Contractuel
                        </small>
                        <strong style={{ fontSize: "0.9rem" }}>
                          {contractualMonthlyHours}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="d-flex flex-column gap-2">
                    {/* Planned Hours */}
                    <div
                      className="d-flex align-items-center justify-content-between p-2 rounded"
                      style={{ backgroundColor: "#e7f1ff" }}
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          icon="ri:calendar-line"
                          width={20}
                          className="me-2"
                          style={{ color: "#0d6efd" }}
                        />
                        <span style={{ fontSize: "0.85rem" }}>Heures planifiées</span>
                      </div>
                      <strong style={{ color: "#0d6efd", fontSize: "0.9rem" }}>
                        {plannedHours}
                      </strong>
                    </div>

                    {/* Actual Hours */}
                    <div
                      className="d-flex align-items-center justify-content-between p-2 rounded"
                      style={{ backgroundColor: "#d1fae5" }}
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          icon="ri:time-line"
                          width={20}
                          className="me-2"
                          style={{ color: "#10b981" }}
                        />
                        <span style={{ fontSize: "0.85rem" }}>Heures réalisées</span>
                      </div>
                      <strong style={{ color: "#10b981", fontSize: "0.9rem" }}>
                        {actualHours}
                      </strong>
                    </div>

                    {/* Projected Hours */}
                    <div
                      className="d-flex align-items-center justify-content-between p-2 rounded"
                      style={{ backgroundColor: "#ede9fe" }}
                    >
                      <div className="d-flex align-items-center">
                        <Icon
                          icon="ri:line-chart-line"
                          width={20}
                          className="me-2"
                          style={{ color: "#8b5cf6" }}
                        />
                        <span style={{ fontSize: "0.85rem" }}>Heures projetées</span>
                      </div>
                      <strong style={{ color: "#8b5cf6", fontSize: "0.9rem" }}>
                        {projectedHours}
                      </strong>
                    </div>
                  </div>

                  {/* Footer note */}
                  {actualHours === "0:00" && (
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: "#f0f9ff" }}>
                      <small className="text-primary" style={{ fontSize: "0.75rem" }}>
                        Pas d'heures pointées ce mois-ci
                      </small>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
