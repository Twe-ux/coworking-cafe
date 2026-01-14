"use client";

import { useState, useEffect } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { formatTimeFR, formatHoursToHHMM } from "@/lib/utils/time-tracking";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole: string;
}

interface ActiveShift {
  _id: string;
  clockIn: string;
  shiftNumber: number;
  currentDuration?: number;
}

interface ClockingWidgetProps {
  employee: Employee;
  onClockingChange?: () => void;
}

export default function ClockingWidget({
  employee,
  onClockingChange,
}: ClockingWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure actuelle chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Charger le shift actif au montage
  useEffect(() => {
    loadActiveShift();
  }, [employee._id]);

  const loadActiveShift = async () => {
    try {
      const response = await fetch(
        `/api/hr/time-entries?employeeId=${employee._id}&status=active`
      );
      const data = await response.json();

      if (data.success && data.timeEntries.length > 0) {
        setActiveShift(data.timeEntries[0]);
      } else {
        setActiveShift(null);
      }
    } catch (error) {
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/hr/time-entries/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du pointage");
      }

      setSuccess("Pointage d'arrivée enregistré !");
      setActiveShift({
        _id: data.timeEntry._id,
        clockIn: data.timeEntry.clockIn,
        shiftNumber: data.timeEntry.shiftNumber,
      });

      onClockingChange?.();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!activeShift) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

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

      setSuccess(
        `Pointage de départ enregistré ! Durée : ${formatHoursToHHMM(
          data.timeEntry.totalHours
        )}`
      );
      setActiveShift(null);

      onClockingChange?.();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer la durée depuis le clock-in
  const calculateDuration = () => {
    if (!activeShift) return "0:00";

    const start = new Date(activeShift.clockIn);
    const durationMs = currentTime.getTime() - start.getTime();
    const hours = durationMs / (1000 * 60 * 60);

    return formatHoursToHHMM(hours);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body className="p-4">
        {/* En-tête */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h5 className="mb-1">
              {employee.firstName} {employee.lastName}
            </h5>
            <small className="text-muted">{employee.employeeRole}</small>
          </div>
          <div className="text-end">
            <div className="h4 mb-0">{formatTimeFR(currentTime)}</div>
            <small className="text-muted">
              {currentTime.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </small>
          </div>
        </div>

        {/* Alertes */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Shift actif */}
        {activeShift && (
          <div
            className="p-3 rounded mb-4"
            style={{ backgroundColor: "#d1fae5" }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Icon
                  icon="eva:clock-outline"
                  width={24}
                  className="text-success me-2"
                />
                <div>
                  <div className="fw-bold text-success">
                    Shift #{activeShift.shiftNumber} en cours
                  </div>
                  <small className="text-muted">
                    Arrivée : {formatTimeFR(activeShift.clockIn)}
                  </small>
                </div>
              </div>
              <div className="text-end">
                <div className="h5 mb-0 text-success">
                  {calculateDuration()}
                </div>
                <small className="text-muted">Durée</small>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="d-grid gap-3">
          {!activeShift ? (
            <Button
              variant="success"
              size="lg"
              onClick={handleClockIn}
              disabled={loading}
              className="py-3"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Pointage en cours...
                </>
              ) : (
                <>
                  <Icon icon="eva:log-in-outline" width={24} className="me-2" />
                  Pointer l'arrivée
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              onClick={handleClockOut}
              disabled={loading}
              className="py-3"
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Pointage en cours...
                </>
              ) : (
                <>
                  <Icon
                    icon="eva:log-out-outline"
                    width={24}
                    className="me-2"
                  />
                  Pointer le départ
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 rounded" style={{ backgroundColor: "#f0f9ff" }}>
          <small className="text-primary">
            <Icon icon="eva:info-outline" width={16} className="me-1" />
            Maximum 2 shifts par jour. Pensez à pointer votre départ en fin de
            service.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
