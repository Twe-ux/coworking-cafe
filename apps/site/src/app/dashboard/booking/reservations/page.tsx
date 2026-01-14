"use client";

import { useEffect, useState } from "react";
import { Card, Table, Badge, Button, Form, Row, Col, Alert } from "react-bootstrap";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { useTopbarContext } from "@/context/useTopbarContext";
import { useSearchParams } from "next/navigation";
import AdminCancelReservationModal from "@/components/site/booking/AdminCancelReservationModal";
import { getDbSpaceTypeLabel } from "@/lib/space-types";

interface Reservation {
  _id: string;
  user: {
    name: string;
    email: string;
    username?: string;
  };
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel";
  date: string;
  startTime: string;
  endTime: string;
  reservationType?: "hourly" | "daily" | "weekly" | "monthly";
  numberOfPeople: number;
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  attendanceStatus?: "present" | "absent";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  requiresPayment: boolean;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  confirmationNumber?: string;
  additionalServices?: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "secondary",
  present: "success",
  absent: "danger",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
  present: "Présenté",
  absent: "Non présenté",
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

// Removed: using centralized getDbSpaceTypeLabel from @/lib/space-types instead

export default function AdminReservationsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(statusParam || "");
  const [filterSpaceType, setFilterSpaceType] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle('Gestion des Réservations');
    setPageActions(
      <>
        <button
          onClick={() => setFilterStatus('')}
          style={{
            padding: '8px 16px',
            background: filterStatus === '' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === '' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          style={{
            padding: '8px 16px',
            background: filterStatus === 'pending' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === 'pending' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          En attente
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          style={{
            padding: '8px 16px',
            background: filterStatus === 'confirmed' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === 'confirmed' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Confirmées
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          style={{
            padding: '8px 16px',
            background: filterStatus === 'cancelled' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === 'cancelled' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Annulées
        </button>
        <button
          onClick={() => setFilterStatus('present')}
          style={{
            padding: '8px 16px',
            background: filterStatus === 'present' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === 'present' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Présentés
        </button>
        <button
          onClick={() => setFilterStatus('absent')}
          style={{
            padding: '8px 16px',
            background: filterStatus === 'absent' ? '#667eea' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: filterStatus === 'absent' ? 'white' : '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          Non présentés
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          + Filtrer
        </button>
      </>
    );

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [filterStatus, setPageTitle, setPageActions, showFilters]);

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, filterSpaceType]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Handle attendance status filters (present/absent)
      if (filterStatus === "present" || filterStatus === "absent") {
        params.append("attendanceStatus", filterStatus);
      } else if (filterStatus) {
        // Regular status filters (pending/confirmed/cancelled/completed)
        params.append("status", filterStatus);
      }

      if (filterSpaceType) params.append("spaceType", filterSpaceType);

      const response = await fetch(`/api/admin/reservations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du chargement des réservations" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du chargement des réservations" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Statut mis à jour avec succès" });
        fetchReservations();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de la mise à jour" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    }
  };

  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedBooking(reservation);
    setShowCancelModal(true);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const handleCancellationComplete = () => {
    setMessage({ type: "success", text: "Réservation annulée avec succès" });
    fetchReservations();
    handleCancelModalClose();
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
      <div className="container-fluid">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Gestion des Réservations</h4>
          </div>
        </div>
      </div>

      {message && (
        <Alert
          variant={message.type === "success" ? "success" : "danger"}
          dismissible
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Filtrer par statut</Form.Label>
                <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                  <option value="completed">Terminée</option>
                  <option value="present">Présenté</option>
                  <option value="absent">Non présenté</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label>Filtrer par espace</Form.Label>
                <Form.Select
                  value={filterSpaceType}
                  onChange={(e) => setFilterSpaceType(e.target.value)}
                >
                  <option value="">Tous les espaces</option>
                  <option value="open-space">Open-space</option>
                  <option value="salle-verriere">Salle Verrière</option>
                  <option value="salle-etage">Salle Étage</option>
                  <option value="evenementiel">Événementiel</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Espace</th>
                  <th>Date/Heure</th>
                  <th>Personnes</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <i className="bi bi-calendar-x display-4 text-muted"></i>
                      <p className="mt-2 text-muted">Aucune réservation trouvée</p>
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td>
                        <div>
                          <strong>{reservation.contactName || reservation.user.name}</strong>
                        </div>
                        <small className="text-muted">
                          {reservation.contactEmail || reservation.user.email}
                        </small>
                      </td>
                      <td>{getDbSpaceTypeLabel(reservation.spaceType)}</td>
                      <td>
                        <div>{formatDate(reservation.date)}</div>
                        <small className="text-muted">
                          {reservation.startTime} - {reservation.endTime}
                        </small>
                      </td>
                      <td>{reservation.numberOfPeople}</td>
                      <td>
                        <strong>{reservation.totalPrice.toFixed(2)}€</strong>
                        {reservation.servicesPrice > 0 && (
                          <small className="d-block text-muted">
                            +{reservation.servicesPrice.toFixed(2)}€ services
                          </small>
                        )}
                      </td>
                      <td>
                        <Badge bg={statusColors[reservation.status] || "secondary"}>
                          {statusLabels[reservation.status] || reservation.status}
                        </Badge>
                        {reservation.attendanceStatus && (
                          <Badge
                            bg={statusColors[reservation.attendanceStatus] || "secondary"}
                            className="ms-1"
                          >
                            {statusLabels[reservation.attendanceStatus] || reservation.attendanceStatus}
                          </Badge>
                        )}
                      </td>
                      <td>
                        {reservation.requiresPayment ? (
                          <Badge
                            bg={paymentStatusColors[reservation.paymentStatus] || "secondary"}
                          >
                            {paymentStatusLabels[reservation.paymentStatus] ||
                              reservation.paymentStatus}
                          </Badge>
                        ) : (
                          <span className="text-muted small">Sans paiement</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {reservation.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleUpdateStatus(reservation._id, "confirmed")}
                            >
                              <IconifyIcon icon="ri:check-line" />
                            </Button>
                          )}
                          {reservation.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleCancelReservation(reservation)}
                              title="Annuler la réservation"
                            >
                              <IconifyIcon icon="ri:close-line" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <AdminCancelReservationModal
        reservation={selectedBooking}
        show={showCancelModal}
        onHide={handleCancelModalClose}
        onCancelled={handleCancellationComplete}
      />
    </div>
  );
}
