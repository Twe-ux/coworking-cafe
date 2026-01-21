'use client';

import { useState } from 'react';
import { Modal, Button, Alert, Spinner, Form } from 'react-bootstrap';

interface Reservation {
  _id: string;
  spaceType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  totalPrice: number;
  status: string;
  numberOfPeople: number;
  confirmationNumber?: string;
  contactName?: string;
  contactEmail?: string;
}

interface AdminCancelReservationModalProps {
  reservation: Reservation | null;
  show: boolean;
  onHide: () => void;
  onCancelled?: () => void;
}

export default function AdminCancelReservationModal({
  reservation,
  show,
  onHide,
  onCancelled,
}: AdminCancelReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  // Handle modal close
  const handleClose = () => {
    setReason('');
    setError(null);
    setSuccess(null);
    onHide();
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (!reservation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reservations/${reservation._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Échec de l\'annulation de la réservation');
      }

      setSuccess(
        reservation.status === 'pending'
          ? 'Réservation refusée avec succès. Un email a été envoyé au client.'
          : 'Réservation annulée avec succès. Un email a été envoyé au client.'
      );

      // Call onCancelled callback after short delay
      setTimeout(() => {
        if (onCancelled) onCancelled();
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  const bookingDate = new Date(reservation.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isPending = reservation.status === 'pending';
  const modalTitle = isPending ? 'Refuser la réservation' : 'Annuler la réservation';
  const actionButtonText = isPending ? 'Refuser' : 'Annuler';

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="text-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </Alert>
        )}

        {!success && (
          <>
            <div className="mb-4">
              <h6 className="text-muted mb-3">Détails de la réservation</h6>
              <div className="bg-light p-3 rounded">
                {reservation.confirmationNumber && (
                  <p className="mb-2">
                    <strong>N° :</strong> {reservation.confirmationNumber}
                  </p>
                )}
                <p className="mb-2">
                  <strong>Client :</strong> {reservation.contactName || 'N/A'} ({reservation.contactEmail || 'N/A'})
                </p>
                <p className="mb-2">
                  <strong>Espace :</strong> {reservation.spaceType}
                </p>
                <p className="mb-2">
                  <strong>Date :</strong> {bookingDate}
                </p>
                {reservation.startTime && reservation.endTime && (
                  <p className="mb-2">
                    <strong>Horaire :</strong> {reservation.startTime} - {reservation.endTime}
                  </p>
                )}
                <p className="mb-2">
                  <strong>Nombre de personnes :</strong> {reservation.numberOfPeople}
                </p>
                <p className="mb-0">
                  <strong>Montant :</strong> {reservation.totalPrice.toFixed(2)}€
                </p>
              </div>
            </div>

            {isPending && (
              <div className="mb-4">
                <Form.Group>
                  <Form.Label>
                    Raison du refus <span className="text-muted">(optionnel)</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Espace non disponible à cette date, demande hors délai, etc."
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Cette raison sera incluse dans l'email envoyé au client.
                  </Form.Text>
                </Form.Group>
              </div>
            )}

            <Alert variant="warning" className="mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Attention :</strong> Cette action est irréversible. {isPending ? 'Le client recevra un email de refus.' : 'Le client recevra un email d\'annulation.'}
            </Alert>
          </>
        )}
      </Modal.Body>

      {!success && (
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Retour
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                {isPending ? 'Refus...' : 'Annulation...'}
              </>
            ) : (
              <>
                <i className="bi bi-x-circle me-2"></i>
                Confirmer {actionButtonText.toLowerCase()}
              </>
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
