"use client";

import { useState } from "react";
import { Button, Form, Badge, Spinner } from "react-bootstrap";
import { Icon } from "@iconify/react";
import { formatTimeFR, formatHoursToHHMM } from "@/lib/utils/time-tracking";

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

interface TimeEntryRowProps {
  entry: TimeEntry;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export default function TimeEntryRow({
  entry,
  onUpdate,
  onDelete,
}: TimeEntryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clockIn, setClockIn] = useState(
    new Date(entry.clockIn).toISOString().slice(0, 16)
  );
  const [clockOut, setClockOut] = useState(
    entry.clockOut
      ? new Date(entry.clockOut).toISOString().slice(0, 16)
      : ""
  );

  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/hr/time-entries/${entry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clockIn: new Date(clockIn).toISOString(),
          clockOut: clockOut ? new Date(clockOut).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setClockIn(new Date(entry.clockIn).toISOString().slice(0, 16));
    setClockOut(
      entry.clockOut
        ? new Date(entry.clockOut).toISOString().slice(0, 16)
        : ""
    );
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce pointage ?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/hr/time-entries/${entry._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      onDelete(entry._id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasAnomalies = entry.anomalies && entry.anomalies.length > 0;
  const isActive = entry.status === "active";

  return (
    <tr
      style={{
        backgroundColor: hasAnomalies ? "#fef2f2" : "white",
        borderLeft: hasAnomalies ? "3px solid #ef4444" : "none",
      }}
    >
      {/* Employé */}
      <td style={{ fontSize: "13px" }}>
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: entry.employeeId.employeeColor || "#3b82f6",
            }}
          />
          <span>
            {entry.employeeId.firstName} {entry.employeeId.lastName}
          </span>
        </div>
      </td>

      {/* Date */}
      <td style={{ fontSize: "13px" }}>
        {new Date(entry.date).toLocaleDateString("fr-FR")}
      </td>

      {/* Shift */}
      <td style={{ fontSize: "13px" }}>
        <Badge
          bg={entry.shiftNumber === 1 ? "primary" : "secondary"}
          style={{ fontSize: "11px" }}
        >
          Shift {entry.shiftNumber}
        </Badge>
      </td>

      {/* Clock In */}
      <td style={{ fontSize: "13px" }}>
        {isEditing ? (
          <Form.Control
            type="datetime-local"
            size="sm"
            value={clockIn}
            onChange={(e) => setClockIn(e.target.value)}
            style={{ fontSize: "12px" }}
          />
        ) : (
          formatTimeFR(entry.clockIn)
        )}
      </td>

      {/* Clock Out */}
      <td style={{ fontSize: "13px" }}>
        {isEditing ? (
          <Form.Control
            type="datetime-local"
            size="sm"
            value={clockOut}
            onChange={(e) => setClockOut(e.target.value)}
            style={{ fontSize: "12px" }}
          />
        ) : entry.clockOut ? (
          formatTimeFR(entry.clockOut)
        ) : (
          <Badge bg="warning" style={{ fontSize: "11px" }}>
            En cours
          </Badge>
        )}
      </td>

      {/* Durée */}
      <td style={{ fontSize: "13px" }}>
        {entry.totalHours ? (
          <span className="fw-semibold">
            {formatHoursToHHMM(entry.totalHours)}
          </span>
        ) : (
          <span className="text-muted">-</span>
        )}
      </td>

      {/* Statut / Anomalies */}
      <td style={{ fontSize: "12px" }}>
        {hasAnomalies ? (
          <div>
            {entry.anomalies!.map((anomaly, index) => (
              <Badge
                key={index}
                bg="danger"
                className="mb-1 d-block"
                style={{ fontSize: "10px" }}
              >
                {anomaly}
              </Badge>
            ))}
          </div>
        ) : isActive ? (
          <Badge bg="success" style={{ fontSize: "11px" }}>
            Actif
          </Badge>
        ) : (
          <Badge bg="secondary" style={{ fontSize: "11px" }}>
            Terminé
          </Badge>
        )}
      </td>

      {/* Actions */}
      <td>
        {isEditing ? (
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="success"
              onClick={handleSave}
              disabled={loading}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Icon icon="ri:save-line" width={14} />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleCancel}
              disabled={loading}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              <Icon icon="ri:close-line" width={14} />
            </Button>
          </div>
        ) : (
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => setIsEditing(true)}
              title="Modifier"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              <Icon icon="ri:edit-line" width={14} />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={handleDelete}
              disabled={loading}
              title="Supprimer"
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Icon icon="ri:delete-bin-line" width={14} />
              )}
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
