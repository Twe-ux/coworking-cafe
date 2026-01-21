"use client";

import { useTopbarContext } from "../../context/useTopbarContext";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";

interface Reservation {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  contactName?: string;
  contactEmail?: string;
}

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open-space",
  "salle-verriere": "Salle Verrière",
  "salle-etage": "Salle Étage",
  evenementiel: "Événementiel",
  desk: "Bureau",
  "meeting-room": "Salle de réunion",
  "private-office": "Bureau privé",
  "event-space": "Espace événementiel",
};

const spaceTypeColors: Record<string, string> = {
  "open-space": "#039be5",
  "salle-verriere": "#0b8043",
  "salle-etage": "#f09300",
  evenementiel: "#d50000",
  desk: "#7986cb",
  "meeting-room": "#33b679",
  "private-office": "#8e24aa",
  "event-space": "#e67c73",
};

export default function DashboardPage() {
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
  });
  const { setPageTitle } = useTopbarContext();

  useEffect(() => {
    setPageTitle("Tableau de bord");
    fetchTodayReservations();
  }, [setPageTitle]);

  const fetchTodayReservations = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Récupérer les réservations d'aujourd'hui
      const todayResponse = await fetch(
        `/api/admin/reservations?startDate=${today}&endDate=${today}`,
      );
      const todayData = await todayResponse.json();

      // Récupérer toutes les réservations en attente
      const pendingResponse = await fetch(
        `/api/admin/reservations?status=pending`,
      );
      const pendingData = await pendingResponse.json();

      if (todayData.success) {
        const activeReservations = todayData.data.filter(
          (r: Reservation) => r.status !== "cancelled",
        );
        setTodayReservations(activeReservations);

        setStats({
          total: activeReservations.length,
          confirmed: activeReservations.filter(
            (r: Reservation) => r.status === "confirmed",
          ).length,
          pending: pendingData.success ? pendingData.data.length : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching today's reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={4} md={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    marginRight: "16px",
                  }}
                >
                  <Icon
                    icon="ri:calendar-check-line"
                    width={28}
                    style={{ color: "white" }}
                  />
                </div>
                <div>
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    Réservations aujourd'hui
                  </p>
                  <h3
                    className="mb-0"
                    style={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    {stats.total}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                    marginRight: "16px",
                  }}
                >
                  <Icon
                    icon="ri:checkbox-circle-line"
                    width={28}
                    style={{ color: "white" }}
                  />
                </div>
                <div>
                  <p
                    className="text-muted mb-1"
                    style={{ fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    Confirmées
                  </p>
                  <h3
                    className="mb-0"
                    style={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    {stats.confirmed}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Link
            href="/dashboard/booking/reservations?status=pending"
            style={{ textDecoration: "none" }}
          >
            <Card
              className="border-0 shadow-sm"
              style={{
                borderRadius: "16px",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                      marginRight: "16px",
                    }}
                  >
                    <Icon
                      icon="ri:time-line"
                      width={28}
                      style={{ color: "white" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-muted mb-1"
                      style={{ fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      En attente
                    </p>
                    <h3
                      className="mb-0"
                      style={{ fontWeight: 700, color: "#1F2937" }}
                    >
                      {stats.pending}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Today's Reservations */}
      <Row>
        <Col lg={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "16px" }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4
                    className="mb-1"
                    style={{ fontWeight: 700, color: "#1F2937" }}
                  >
                    <Icon
                      icon="ri:calendar-event-line"
                      width={24}
                      className="me-2"
                      style={{ color: "#667eea" }}
                    />
                    Réservations d'aujourd'hui
                  </h4>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {new Date().toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Link href="/dashboard/booking/calendar">
                  <button
                    style={{
                      padding: "10px 20px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "12px",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(102, 126, 234, 0.3)";
                    }}
                  >
                    <Icon icon="ri:calendar-line" width={18} />
                    Voir le calendrier
                  </button>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : todayReservations.length === 0 ? (
                <div className="text-center py-5">
                  <Icon
                    icon="ri:calendar-2-line"
                    width={64}
                    style={{ color: "#E5E7EB", marginBottom: "16px" }}
                  />
                  <p className="text-muted mb-0" style={{ fontSize: "1rem" }}>
                    Aucune réservation pour aujourd'hui
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {todayReservations.map((reservation) => (
                    <Link
                      key={reservation._id}
                      href="/dashboard/booking/calendar"
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          padding: "20px",
                          background: "#F9FAFB",
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#F3F4F6";
                          e.currentTarget.style.borderColor = "#D1D5DB";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#F9FAFB";
                          e.currentTarget.style.borderColor = "#E5E7EB";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: "4px",
                              height: "60px",
                              borderRadius: "2px",
                              background:
                                spaceTypeColors[reservation.spaceType] ||
                                "#667eea",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span
                                style={{
                                  fontSize: "16px",
                                  fontWeight: 600,
                                  color: "#1F2937",
                                }}
                              >
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                              <div
                                style={{
                                  padding: "4px 12px",
                                  background:
                                    spaceTypeColors[reservation.spaceType] ||
                                    "#667eea",
                                  color: "white",
                                  borderRadius: "8px",
                                  fontSize: "12px",
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
                                      : reservation.status === "completed"
                                        ? "primary"
                                        : "secondary"
                                }
                                style={{ fontSize: "11px" }}
                              >
                                {reservation.status === "confirmed"
                                  ? "Confirmée"
                                  : reservation.status === "pending"
                                    ? "En attente"
                                    : reservation.status === "completed"
                                      ? "Terminée"
                                      : reservation.status}
                              </Badge>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                style={{ fontSize: "14px", color: "#6B7280" }}
                              >
                                <Icon
                                  icon="ri:user-line"
                                  width={16}
                                  style={{ marginRight: "6px" }}
                                />
                                {reservation.contactName ||
                                  reservation.user.name}
                              </div>
                              <div
                                style={{ fontSize: "14px", color: "#6B7280" }}
                              >
                                <Icon
                                  icon="ri:group-line"
                                  width={16}
                                  style={{ marginRight: "6px" }}
                                />
                                {reservation.numberOfPeople} personne
                                {reservation.numberOfPeople > 1 ? "s" : ""}
                              </div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  color: "#10B981",
                                  fontWeight: 600,
                                }}
                              >
                                <Icon
                                  icon="ri:money-euro-circle-line"
                                  width={16}
                                  style={{ marginRight: "6px" }}
                                />
                                {reservation.totalPrice.toFixed(2)}€
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
