"use client";

import { useState, useEffect } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole?: string;
  employeeColor?: string;
}

interface Shift {
  _id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  shiftType?: string;
}

interface StaffScheduleViewProps {
  employees: Employee[];
}

export default function StaffScheduleView({ employees }: StaffScheduleViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weekDates, setWeekDates] = useState<Date[][]>([]);

  useEffect(() => {
    if (employees.length > 0) {
      loadSchedule();
    }
  }, [employees]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculer la période (semaine en cours + 2 suivantes)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 21); // 3 semaines
      endDate.setHours(23, 59, 59, 999);

      // Charger les shifts de tous les employés
      const allShifts: Shift[] = [];
      for (const employee of employees) {
        const response = await fetch(
          `/api/hr/shifts?employeeId=${employee._id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        const data = await response.json();

        if (response.ok && data.shifts) {
          allShifts.push(...data.shifts);
        }
      }

      setShifts(allShifts);

      // Générer les dates pour les semaines (semaine courante + 2 suivantes)
      const weeks: Date[][] = [];
      let currentDate = new Date(startDate);

      // Trouver le lundi de la semaine courante
      const dayOfWeek = currentDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi = 1
      const firstMonday = new Date(currentDate);
      firstMonday.setDate(currentDate.getDate() + diff);

      for (let week = 0; week < 3; week++) {
        const weekDays: Date[] = [];
        const monday = new Date(firstMonday);
        monday.setDate(firstMonday.getDate() + week * 7);

        for (let day = 0; day < 7; day++) {
          const date = new Date(monday);
          date.setDate(monday.getDate() + day);
          weekDays.push(date);
        }

        weeks.push(weekDays);
      }

      setWeekDates(weeks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getShiftsForEmployeeAndDate = (
    employeeId: string,
    date: Date
  ): Shift[] => {
    const dateStr = date.toISOString().split("T")[0];
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date).toISOString().split("T")[0];
      return shift.employeeId === employeeId && shiftDate === dateStr;
    });
  };

  const getEmployeeColor = (employeeId: string): string => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.employeeColor || "#3b82f6";
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0">Chargement du planning...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Icon icon="eva:alert-circle-outline" width={20} className="me-2" />
        {error}
      </Alert>
    );
  }

  return (
    <Card
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <Card.Body className="p-3">
        <div className="mb-3">
          <h6 className="mb-1 fw-bold" style={{ fontSize: "16px" }}>
            Mon Planning
          </h6>
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Vos créneaux de travail par semaine
          </p>
        </div>

        {weekDates.map((week, weekIndex) => (
          <div key={weekIndex} className="mb-4">
            <h6
              className="mb-2"
              style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}
            >
              Semaine du {formatDate(week[0])} au {formatDate(week[6])}{" "}
              {new Date().getFullYear()}
            </h6>

            <div className="table-responsive">
              <table
                className="table table-bordered mb-0"
                style={{
                  borderColor: "#e5e7eb",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      className="text-center"
                      style={{
                        width: "100px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        borderColor: "#e5e7eb",
                        backgroundColor: "#f9fafb",
                        padding: "8px 4px",
                      }}
                    >
                      Staff
                    </th>
                    {week.map((date, index) => (
                      <th
                        key={index}
                        className="text-center"
                        style={{
                          fontSize: "11px",
                          fontWeight: "500",
                          color: isToday(date) ? "#2563eb" : "#6b7280",
                          borderColor: "#e5e7eb",
                          backgroundColor: isToday(date)
                            ? "#dbeafe"
                            : "#f9fafb",
                          padding: "6px 4px",
                        }}
                      >
                        <div style={{ fontSize: "10px", marginBottom: "2px" }}>
                          {getDayName(date).slice(0, 3)}
                        </div>
                        <div
                          style={{
                            fontSize: isToday(date) ? "16px" : "15px",
                            fontWeight: isToday(date) ? "700" : "600",
                          }}
                        >
                          {date.getDate()}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, empIndex) => (
                    <tr key={employee._id}>
                      <td
                        className="align-middle"
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          borderColor: "#e5e7eb",
                          backgroundColor: "#f9fafb",
                          padding: "8px",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                employee.employeeColor || "#3b82f6",
                              flexShrink: 0,
                            }}
                          />
                          <span>{employee.firstName}</span>
                        </div>
                      </td>
                      {week.map((date, dateIndex) => {
                        const dayShifts = getShiftsForEmployeeAndDate(
                          employee._id,
                          date
                        );
                        return (
                          <td
                            key={dateIndex}
                            className="p-1"
                            style={{
                              verticalAlign: "middle",
                              borderColor: "#e5e7eb",
                              backgroundColor: isToday(date)
                                ? "#dbeafe"
                                : "white",
                            }}
                          >
                            {dayShifts.length > 0 ? (
                              <div className="d-flex flex-column gap-1">
                                {dayShifts.map((shift) => (
                                  <div
                                    key={shift._id}
                                    className="px-2 py-1 rounded text-center"
                                    style={{
                                      backgroundColor:
                                        employee.employeeColor || "#3b82f6",
                                      color: "#fff",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {shift.startTime}-{shift.endTime}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
}
