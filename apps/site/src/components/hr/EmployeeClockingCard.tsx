"use client";

import { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { formatTimeFR, formatHoursToHHMM } from "@/lib/utils/time-tracking";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole?: string;
  employeeColor?: string;
  clockingCode: string;
}

interface ActiveShift {
  _id: string;
  clockIn: string;
  shiftNumber: number;
}

interface EmployeeClockingCardProps {
  employee: Employee;
  onPinRequest: (employee: Employee) => void;
  refreshTrigger?: number;
}

export default function EmployeeClockingCard({
  employee,
  onPinRequest,
  refreshTrigger,
}: EmployeeClockingCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftsToday, setShiftsToday] = useState(0);

  // Mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Charger le shift actif au montage et quand refreshTrigger change
  useEffect(() => {
    loadActiveShift();
  }, [employee._id, refreshTrigger]);

  const loadActiveShift = async () => {
    try {
      // Charger les shifts actifs
      const activeResponse = await fetch(
        `/api/hr/time-entries?employeeId=${employee._id}&status=active`
      );
      const activeData = await activeResponse.json();

      if (activeData.success && activeData.timeEntries.length > 0) {
        setActiveShift(activeData.timeEntries[0]);
      } else {
        setActiveShift(null);
      }

      // Charger le nombre total de shifts aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayResponse = await fetch(
        `/api/hr/time-entries?employeeId=${employee._id}&date=${today.toISOString().split("T")[0]}`
      );
      const todayData = await todayResponse.json();

      if (todayData.success) {
        setShiftsToday(todayData.timeEntries.length);
      }
    } catch (error) {
    }
  };

  const handleClockIn = () => {
    onPinRequest(employee);
  };

  const handleClockOut = async () => {
    if (!activeShift) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/hr/time-entries/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeEntryId: activeShift._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du pointage");
      }

      setActiveShift(null);
      loadActiveShift(); // Recharger pour mettre à jour le compteur
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la durée depuis le clock-in
  const calculateDuration = () => {
    if (!activeShift) return "00:00:00";

    const start = new Date(activeShift.clockIn);
    const durationMs = currentTime.getTime() - start.getTime();

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const hasActiveShift = !!activeShift;

  return (
    <Card
      className="h-100"
      style={{
        border: hasActiveShift ? "2px solid #10b981" : "1px solid #e5e7eb",
        backgroundColor: hasActiveShift ? "#f0fdf4" : "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
      }}
    >
      <Card.Body className="p-3">
        {/* En-tête avec nom et compteur de shifts */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: employee.employeeColor || "#3b82f6",
              }}
            />
            <span className="fw-semibold" style={{ fontSize: "15px" }}>
              {employee.firstName} {employee.lastName}
            </span>
          </div>
          <div className="d-flex align-items-center gap-1 text-muted">
            <Icon icon="ri:user-line" width={14} />
            <span style={{ fontSize: "13px" }}>{shiftsToday}/2</span>
          </div>
        </div>

        {/* Zone centrale */}
        <div className="text-center mb-3" style={{ minHeight: "110px" }}>
          {error && (
            <Alert variant="danger" className="mb-2 py-2">
              <small style={{ fontSize: "12px" }}>{error}</small>
            </Alert>
          )}

          {hasActiveShift ? (
            <>
              {/* Shift actif */}
              <div
                className="p-3 rounded mb-2"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                    }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: "500" }}>
                    Shift {activeShift.shiftNumber}
                  </span>
                </div>
                <div
                  className="fw-bold mb-1"
                  style={{ fontSize: "22px", color: "#10b981" }}
                >
                  {calculateDuration()}
                </div>
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  Début : {formatTimeFR(activeShift.clockIn)}
                </small>
              </div>
            </>
          ) : (
            <>
              {/* Aucun pointage actif */}
              <Icon
                icon="ri:time-line"
                width={40}
                className="text-muted mb-2"
                style={{ opacity: 0.25 }}
              />
              <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
                Aucun pointage actif
              </p>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Cliquez pour commencer
              </small>
            </>
          )}
        </div>

        {/* Bouton d'action */}
        <div className="d-grid">
          {hasActiveShift ? (
            <Button
              variant="danger"
              onClick={handleClockOut}
              disabled={loading}
              className="py-2"
              style={{
                backgroundColor: "#dc2626",
                borderColor: "#dc2626",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Arrêt en cours...
                </>
              ) : (
                <>
                  <Icon icon="ri:stop-circle-line" width={18} className="me-2" />
                  Arrêter le pointage
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleClockIn}
              disabled={loading || shiftsToday >= 2}
              className="py-2"
              style={{
                backgroundColor: "#6b9f7f",
                borderColor: "#6b9f7f",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
            >
              <Icon icon="ri:play-circle-line" width={18} className="me-2" />
              Commencer le pointage
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
