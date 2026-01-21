"use client";

import { useEffect, useState } from "react";
import { Card, Table, Badge } from "react-bootstrap";
import { Icon } from "@iconify/react";
import Link from "next/link";

interface Reservation {
  _id: string;
  user: {
    name: string;
    email: string;
    username?: string;
  };
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  contactName?: string;
  contactEmail?: string;
}

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "secondary",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const paymentStatusColors: Record<string, string> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "info",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échoué",
  refunded: "Remboursé",
};

const spaceTypeLabels: Record<string, string> = {
  "open-space": "Open-space",
  "salle-verriere": "Salle Verrière",
  "salle-etage": "Salle Étage",
  "evenementiel": "Événementiel",
  "desk": "Bureau",
  "meeting-room": "Salle de réunion",
  "private-office": "Bureau privé",
  "event-space": "Espace événementiel",
};

const RecentReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/booking/stats");
      const result = await response.json();

      if (result.success) {
        setReservations(result.data.recentReservations);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: "300px" }}></span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title mb-0">Réservations récentes</h5>
          <Link href="/dashboard/reservations" className="btn btn-sm btn-primary">
            Voir tout
            <Icon icon="ri:arrow-right-line" className="ms-1" />
          </Link>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Client</th>
                <th>Espace</th>
                <th>Date/Heure</th>
                <th>Personnes</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Paiement</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <Icon icon="ri:calendar-x-line" width={48} className="text-muted mb-2" />
                    <p className="text-muted mb-0">Aucune réservation récente</p>
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td>
                      <div>
                        <div className="fw-medium">
                          {reservation.contactName || reservation.user.name}
                        </div>
                        <small className="text-muted">
                          {reservation.contactEmail || reservation.user.email}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark">
                        {spaceTypeLabels[reservation.spaceType] || reservation.spaceType}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-medium">{formatDate(reservation.date)}</div>
                        <small className="text-muted">
                          {reservation.startTime} - {reservation.endTime}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Icon icon="ri:user-line" className="me-1 text-muted" width={16} />
                        {reservation.numberOfPeople}
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold">{reservation.totalPrice.toFixed(2)}€</span>
                    </td>
                    <td>
                      <Badge bg={statusColors[reservation.status] || "secondary"}>
                        {statusLabels[reservation.status] || reservation.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={paymentStatusColors[reservation.paymentStatus] || "secondary"}>
                        {paymentStatusLabels[reservation.paymentStatus] ||
                          reservation.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecentReservations;
