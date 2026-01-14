"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Table, Spinner, Badge } from "react-bootstrap";
import { useTopbarContext } from "@/context/useTopbarContext";
import { Icon } from "@iconify/react";
import { formatTimeFR, formatHoursToHHMM } from "@/lib/utils/time-tracking";
import EmployeeMonthlyStats from "@/components/hr/EmployeeMonthlyStats";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeColor?: string;
}

interface TimeEntry {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeColor?: string;
  };
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  shiftNumber: number;
  status: "active" | "completed";
  anomalies?: string[];
}

interface DayRow {
  date: string;
  employeeId: string;
  employeeName: string;
  employeeColor?: string;
  shift1?: TimeEntry;
  shift2?: TimeEntry;
  totalHours: number;
}

interface Stats {
  totalEmployees: number;
  totalHours: number;
  totalShifts: number;
  totalActiveShifts: number;
  totalShiftsWithErrors: number;
}

export default function TimesheetsPage() {
  const { setPageTitle } = useTopbarContext();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [dayRows, setDayRows] = useState<DayRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);

  // Édition inline
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  // Filtres
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // Format YYYY-MM
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setPageTitle("Gestion des Pointages");

    return () => {
      setPageTitle("Dashboard");
    };
  }, [setPageTitle]);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadTimeEntries();
    loadStats();
  }, [selectedMonth, selectedEmployee, selectedStatus]);

  useEffect(() => {
    if (employees.length > 0) {
      loadShifts();
    }
  }, [selectedMonth, employees]);

  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/hr/employees");
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.filter((emp: any) => emp.isActive));
      }
    } catch (error) {
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);

      // Calculer le premier et dernier jour du mois sélectionné
      const [year, month] = selectedMonth.split("-");
      const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
      const lastDay = new Date(parseInt(year), parseInt(month), 0);

      const params = new URLSearchParams();
      params.append("startDate", firstDay.toISOString().split("T")[0]);
      params.append("endDate", lastDay.toISOString().split("T")[0]);
      if (selectedEmployee) params.append("employeeId", selectedEmployee);

      const response = await fetch(`/api/hr/time-entries?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTimeEntries(data.timeEntries);

        // Grouper par date et employé
        const grouped: { [key: string]: DayRow } = {};

        data.timeEntries.forEach((entry: TimeEntry) => {
          const key = `${entry.date}-${entry.employeeId._id}`;

          if (!grouped[key]) {
            grouped[key] = {
              date: entry.date,
              employeeId: entry.employeeId._id,
              employeeName: `${entry.employeeId.firstName} ${entry.employeeId.lastName}`,
              employeeColor: entry.employeeId.employeeColor,
              totalHours: 0,
            };
          }

          if (entry.shiftNumber === 1) {
            grouped[key].shift1 = entry;
          } else {
            grouped[key].shift2 = entry;
          }

          if (entry.totalHours) {
            grouped[key].totalHours += entry.totalHours;
          }
        });

        // Convertir en tableau et trier par date décroissante
        let rows = Object.values(grouped).sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Appliquer les filtres
        if (selectedStatus) {
          rows = rows.filter((row) => {
            const shift1Match = row.shift1?.status === selectedStatus;
            const shift2Match = row.shift2?.status === selectedStatus;
            return shift1Match || shift2Match;
          });
        }

        setDayRows(rows);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculer la période du 1er au dernier jour du mois sélectionné
      const [year, month] = selectedMonth.split("-");
      const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
      const lastDay = new Date(parseInt(year), parseInt(month), 0);

      const params = new URLSearchParams({
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      });

      if (selectedEmployee) {
        params.append("employeeId", selectedEmployee);
      }

      const response = await fetch(`/api/hr/time-entries/stats?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.globalStats);
      }
    } catch (error) {
    }
  };

  const loadShifts = async () => {
    try {
      // Calculer la période du 1er au dernier jour du mois sélectionné
      const [year, month] = selectedMonth.split("-");
      const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
      const lastDay = new Date(parseInt(year), parseInt(month), 0);

      // Charger les shifts de tous les employés actifs
      const allShifts: any[] = [];
      for (const employee of employees) {
        const response = await fetch(
          `/api/hr/shifts?employeeId=${employee._id}&startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`
        );

        const data = await response.json();

        if (data.shifts && Array.isArray(data.shifts)) {
          allShifts.push(...data.shifts);
        }
      }

      setShifts(allShifts);
    } catch (error) {
    }
  };

  const handleCellClick = (cellId: string, currentValue: string, dateValue: string) => {
    setEditingCell(cellId);
    // Extraire seulement l'heure au format HH:mm
    const time = new Date(currentValue).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setEditingValue(time);
  };

  const handleCellSave = async (entryId: string, field: "clockIn" | "clockOut", dateStr: string) => {
    try {
      // Combiner la date avec la nouvelle heure
      const [hours, minutes] = editingValue.split(":");
      const dateTime = new Date(dateStr);
      dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch(`/api/hr/time-entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: dateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setEditingCell(null);
      setEditingValue("");
      loadTimeEntries();
      loadStats();
    } catch (err: any) {
      alert(err.message);
      setEditingCell(null);
      setEditingValue("");
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handlePreviousMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const formatMonthYear = () => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid">
      {/* Statistiques */}
      {stats && (
        <Row className="g-3 mb-4">
          <Col md={3}>
            <Card
              className="border-0"
              style={{
                backgroundColor: "#f0f9ff",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      Total Heures
                    </p>
                    <h4 className="mb-0 fw-bold">
                      {Math.round(stats.totalHours)}h
                    </h4>
                  </div>
                  <Icon
                    icon="ri:time-line"
                    width={32}
                    style={{ color: "#3b82f6", opacity: 0.7 }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card
              className="border-0"
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      Shifts Total
                    </p>
                    <h4 className="mb-0 fw-bold">{stats.totalShifts}</h4>
                  </div>
                  <Icon
                    icon="ri:calendar-check-line"
                    width={32}
                    style={{ color: "#10b981", opacity: 0.7 }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card
              className="border-0"
              style={{
                backgroundColor: "#fef9e7",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      Shifts Actifs
                    </p>
                    <h4 className="mb-0 fw-bold">{stats.totalActiveShifts}</h4>
                  </div>
                  <Icon
                    icon="ri:play-circle-line"
                    width={32}
                    style={{ color: "#f59e0b", opacity: 0.7 }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card
              className="border-0"
              style={{
                backgroundColor: "#fef2f2",
                borderRadius: "12px",
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      Anomalies
                    </p>
                    <h4 className="mb-0 fw-bold">
                      {stats.totalShiftsWithErrors}
                    </h4>
                  </div>
                  <Icon
                    icon="ri:alert-line"
                    width={32}
                    style={{ color: "#ef4444", opacity: 0.7 }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtres */}
      <Card className="mb-4" style={{ borderRadius: "12px" }}>
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Période
                </Form.Label>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={handlePreviousMonth}
                    style={{ padding: "4px 8px" }}
                  >
                    <Icon icon="ri:arrow-left-s-line" width={16} />
                  </Button>
                  <div
                    className="text-center flex-grow-1"
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      textTransform: "capitalize",
                    }}
                  >
                    {formatMonthYear()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={handleNextMonth}
                    style={{ padding: "4px 8px" }}
                  >
                    <Icon icon="ri:arrow-right-s-line" width={16} />
                  </Button>
                </div>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Employé
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Tous les employés</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "500" }}>
                  Statut
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ fontSize: "13px" }}
                >
                  <option value="">Tous</option>
                  <option value="active">Actifs</option>
                  <option value="completed">Terminés</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => {
                  setSelectedMonth(new Date().toISOString().slice(0, 7));
                  setSelectedEmployee("");
                  setSelectedStatus("");
                }}
                className="w-100"
                style={{ fontSize: "13px" }}
              >
                <Icon icon="ri:refresh-line" width={14} className="me-1" />
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Liste des pointages */}
      <Card style={{ borderRadius: "12px" }}>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 mb-0">Chargement...</p>
            </div>
          ) : dayRows.length === 0 ? (
            <div className="text-center py-5">
              <Icon
                icon="ri:file-list-line"
                width={48}
                className="text-muted mb-3"
                style={{ opacity: 0.3 }}
              />
              <p className="text-muted mb-0">Aucun pointage trouvé</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0" style={{ fontSize: "13px" }}>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th style={{ fontSize: "12px", fontWeight: "500", padding: "10px 12px", width: "120px" }}>
                      Date
                    </th>
                    <th style={{ fontSize: "12px", fontWeight: "500", padding: "10px 12px", width: "200px" }}>
                      Employé
                    </th>
                    <th style={{ fontSize: "12px", fontWeight: "500", padding: "10px 12px", width: "180px" }}>
                      Shift 1
                    </th>
                    <th style={{ fontSize: "12px", fontWeight: "500", padding: "10px 12px", width: "180px" }}>
                      Shift 2
                    </th>
                    <th style={{ fontSize: "12px", fontWeight: "500", padding: "10px 12px", width: "100px" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dayRows.map((row) => (
                    <tr key={`${row.date}-${row.employeeId}`}>
                      {/* Date */}
                      <td style={{ fontSize: "13px", padding: "10px 12px" }}>
                        {new Date(row.date).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Employé */}
                      <td style={{ fontSize: "13px", padding: "10px 12px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: row.employeeColor || "#3b82f6",
                            }}
                          />
                          <span>{row.employeeName}</span>
                        </div>
                      </td>

                      {/* Shift 1 */}
                      <td style={{ fontSize: "13px", padding: "10px 12px" }}>
                        {row.shift1 ? (
                          <div className="d-flex gap-2 align-items-center">
                              {editingCell === `${row.shift1._id}-clockIn` ? (
                                <div className="d-flex gap-1 align-items-center">
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    style={{ fontSize: "12px", width: "90px" }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleCellSave(row.shift1!._id, "clockIn", row.shift1!.date)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:check-line" width={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={handleCellCancel}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:close-line" width={12} />
                                  </Button>
                                </div>
                              ) : (
                                <span
                                  className="text-primary"
                                  style={{ cursor: "pointer", textDecoration: "underline" }}
                                  onClick={() =>
                                    handleCellClick(
                                      `${row.shift1!._id}-clockIn`,
                                      row.shift1!.clockIn,
                                      row.shift1!.date
                                    )
                                  }
                                >
                                  {formatTimeFR(row.shift1!.clockIn)}
                                </span>
                              )}
                              <span>-</span>
                              {editingCell === `${row.shift1._id}-clockOut` ? (
                                <div className="d-flex gap-1 align-items-center">
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    style={{ fontSize: "12px", width: "90px" }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleCellSave(row.shift1!._id, "clockOut", row.shift1!.date)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:check-line" width={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={handleCellCancel}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:close-line" width={12} />
                                  </Button>
                                </div>
                              ) : row.shift1.clockOut ? (
                                <span
                                  className="text-primary"
                                  style={{ cursor: "pointer", textDecoration: "underline" }}
                                  onClick={() =>
                                    handleCellClick(
                                      `${row.shift1!._id}-clockOut`,
                                      row.shift1!.clockOut!,
                                      row.shift1!.date
                                    )
                                  }
                                >
                                  {formatTimeFR(row.shift1!.clockOut!)}
                                </span>
                              ) : (
                                <Badge bg="warning" style={{ fontSize: "11px" }}>
                                  En cours
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>

                      {/* Shift 2 */}
                      <td style={{ fontSize: "13px", padding: "10px 12px" }}>
                        {row.shift2 ? (
                          <div className="d-flex gap-2 align-items-center">
                              {editingCell === `${row.shift2._id}-clockIn` ? (
                                <div className="d-flex gap-1 align-items-center">
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    style={{ fontSize: "12px", width: "90px" }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleCellSave(row.shift2!._id, "clockIn", row.shift2!.date)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:check-line" width={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={handleCellCancel}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:close-line" width={12} />
                                  </Button>
                                </div>
                              ) : (
                                <span
                                  className="text-primary"
                                  style={{ cursor: "pointer", textDecoration: "underline" }}
                                  onClick={() =>
                                    handleCellClick(
                                      `${row.shift2!._id}-clockIn`,
                                      row.shift2!.clockIn,
                                      row.shift2!.date
                                    )
                                  }
                                >
                                  {formatTimeFR(row.shift2!.clockIn)}
                                </span>
                              )}
                              <span>-</span>
                              {editingCell === `${row.shift2._id}-clockOut` ? (
                                <div className="d-flex gap-1 align-items-center">
                                  <Form.Control
                                    type="time"
                                    size="sm"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    style={{ fontSize: "12px", width: "90px" }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleCellSave(row.shift2!._id, "clockOut", row.shift2!.date)}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:check-line" width={12} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={handleCellCancel}
                                    style={{ padding: "2px 6px" }}
                                  >
                                    <Icon icon="ri:close-line" width={12} />
                                  </Button>
                                </div>
                              ) : row.shift2.clockOut ? (
                                <span
                                  className="text-primary"
                                  style={{ cursor: "pointer", textDecoration: "underline" }}
                                  onClick={() =>
                                    handleCellClick(
                                      `${row.shift2!._id}-clockOut`,
                                      row.shift2!.clockOut!,
                                      row.shift2!.date
                                    )
                                  }
                                >
                                  {formatTimeFR(row.shift2!.clockOut!)}
                                </span>
                              ) : (
                                <Badge bg="warning" style={{ fontSize: "11px" }}>
                                  En cours
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>

                      {/* Total */}
                      <td style={{ fontSize: "13px", padding: "10px 12px" }}>
                        {row.totalHours > 0 ? (
                          <span className="fw-bold">
                            {formatHoursToHHMM(row.totalHours)}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Statistiques mensuelles par employé */}
      {employees.length > 0 && (
        <EmployeeMonthlyStats
          employees={employees}
          shifts={shifts}
          timeEntries={timeEntries}
          currentDate={new Date(selectedMonth + "-01")}
        />
      )}
    </div>
  );
}
