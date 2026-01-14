import { Modal, Button, Badge } from "react-bootstrap";
import { Icon } from "@iconify/react";

interface Reservation {
  _id: string;
  spaceType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: string;
  user: {
    name: string;
    email: string;
  };
  totalPrice: number;
  contactName?: string;
  contactEmail?: string;
}

interface MoreEventsModalProps {
  show: boolean;
  onHide: () => void;
  moreEventsDate: string;
  moreEvents: Reservation[];
  spaceTypeColors: Record<string, string>;
  spaceTypeLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  onSelectEvent: (event: Reservation) => void;
}

export default function MoreEventsModal({
  show,
  onHide,
  moreEventsDate,
  moreEvents,
  spaceTypeColors,
  spaceTypeLabels,
  statusLabels,
  onSelectEvent,
}: MoreEventsModalProps) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header
        closeButton
        className="border-0"
        style={{ padding: "1.5rem 1.75rem" }}
      >
        <Modal.Title style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Réservations du {moreEventsDate}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "0 1.75rem 1.5rem" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {moreEvents.map((reservation, index) => (
            <div
              key={reservation._id || index}
              onClick={() => onSelectEvent(reservation)}
              style={{
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f3f5";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "4px",
                    height: "48px",
                    borderRadius: "2px",
                    background:
                      spaceTypeColors[reservation.spaceType] || "#667eea",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1e293b",
                      }}
                    >
                      {reservation.startTime} - {reservation.endTime}
                    </span>
                    <div
                      style={{
                        padding: "2px 8px",
                        background:
                          spaceTypeColors[reservation.spaceType] || "#667eea",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {spaceTypeLabels[reservation.spaceType] ||
                        reservation.spaceType}
                    </div>
                    <Badge
                      bg={
                        reservation.status === "confirmed"
                          ? "success"
                          : reservation.status === "pending"
                          ? "warning"
                          : reservation.status === "cancelled"
                          ? "danger"
                          : "secondary"
                      }
                      style={{ fontSize: "10px" }}
                    >
                      {statusLabels[reservation.status]}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    <Icon
                      icon="ri:user-line"
                      width={14}
                      style={{ marginRight: "4px" }}
                    />
                    {reservation.user.name}
                    {reservation.numberOfPeople > 1 &&
                      ` • ${reservation.numberOfPeople} personnes`}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    <Icon
                      icon="ri:money-euro-circle-line"
                      width={14}
                      style={{ marginRight: "4px" }}
                    />
                    {reservation.totalPrice.toFixed(2)}€
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer
        className="border-0"
        style={{ padding: "0 1.75rem 1.5rem" }}
      >
        <Button
          variant="outline-secondary"
          onClick={onHide}
          style={{
            borderRadius: "8px",
            padding: "0.5rem 1.5rem",
            fontWeight: 500,
          }}
        >
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
