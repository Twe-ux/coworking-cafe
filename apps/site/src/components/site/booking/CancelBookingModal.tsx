"use client";

import ProtectedEmail from "@/components/common/ProtectedEmail";
import { useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";

interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  totalPrice: number;
  status: string;
  confirmationNumber?: string;
  space?: {
    name: string;
  };
}

interface CancelBookingModalProps {
  booking: Booking | null;
  show: boolean;
  onHide: () => void;
  onCancelled?: () => void;
}

interface CancellationPreview {
  daysUntilBooking: number;
  chargePercentage: number;
  cancellationFee: number;
  refundAmount: number;
  message: string;
  isPending?: boolean;
  depositAmount?: number; // in euros
}

export default function CancelBookingModal({
  booking,
  show,
  onHide,
  onCancelled,
}: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load cancellation preview when modal opens
  const loadCancellationPreview = async () => {
    if (!booking) return;

    // SECURITY CHECK: Prevent cancellation of past reservations
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      setError(
        "Impossible d'annuler une réservation passée. L'empreinte bancaire a déjà été libérée ou capturée."
      );
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    setError(null);

    try {
      // For pending bookings, cancellation is always free - no need to calculate
      if (booking.status === "pending") {
        // Determine message based on space type
        let cancellationMessage = "";
        if (booking.spaceType === "open-space") {
          cancellationMessage =
            "Attention, des frais d'annulation peuvent s'appliquer selon les <a href='/cgu#article6' target='_blank' rel='noopener noreferrer' style='color: inherit; text-decoration: underline;'>CGVs</a>.<br/><em>Entre 0 et 15 jours calendaires avant la réservation : 50% du montant total sera prélevé.</em>";
        } else if (
          booking.spaceType === "salle-verriere" ||
          booking.spaceType === "salle-etage"
        ) {
          cancellationMessage =
            "Attention, des frais d'annulation peuvent s'appliquer selon les <a href='/cgu#article6' target='_blank' rel='noopener noreferrer' style='color: inherit; text-decoration: underline;'>CGVs</a>.<br/><em>Entre 0 et 29 jours calendaires avant la réservation : jusqu'à 70% du montant total peut être prélevé.</em>";
        } else {
          // Default for evenementiel or other types
          cancellationMessage =
            "Attention, des frais d'annulation peuvent s'appliquer selon les <a href='/cgu#article6' target='_blank' rel='noopener noreferrer' style='color: inherit; text-decoration: underline;'>CGVs</a>.";
        }

        setPreview({
          daysUntilBooking: 0,
          chargePercentage: 0,
          cancellationFee: 0,
          refundAmount: 0,
          message: cancellationMessage,
          isPending: true,
        });
        setLoadingPreview(false);
        return;
      }

      // For confirmed bookings, fetch real cancellation policy from public API
      const policyResponse = await fetch(
        `/api/cancellation-policy?spaceType=${booking.spaceType}`
      );
      const policyData = await policyResponse.json();

      if (!policyData.success) {
        throw new Error("Impossible de récupérer les conditions d'annulation");
      }

      const policy = policyData.data.cancellationPolicy;

      // Calculate actual deposit amount based on deposit policy
      const spaceConfigResponse = await fetch(
        `/api/space-configurations/${booking.spaceType}`
      );
      const spaceConfigData = await spaceConfigResponse.json();

      let depositAmount = booking.totalPrice; // Default to total price

      if (
        spaceConfigData.success &&
        spaceConfigData.data.depositPolicy?.enabled
      ) {
        const depositPolicy = spaceConfigData.data.depositPolicy;
        const totalPriceInCents = booking.totalPrice * 100;
        let depositInCents = totalPriceInCents;

        if (depositPolicy.fixedAmount) {
          depositInCents = depositPolicy.fixedAmount;
        } else if (depositPolicy.percentage) {
          depositInCents = Math.round(
            totalPriceInCents * (depositPolicy.percentage / 100)
          );
        }

        if (
          depositPolicy.minimumAmount &&
          depositInCents < depositPolicy.minimumAmount
        ) {
          depositInCents = depositPolicy.minimumAmount;
        }

        depositAmount = depositInCents / 100; // Convert to euros
      }

      // Calculate days until booking
      const bookingDate = new Date(booking.date);
      const now = new Date();
      const daysUntilBooking = Math.ceil(
        (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine charge percentage based on real policy
      let chargePercentage = 100;
      const sortedTiers = [...policy.tiers].sort(
        (a, b) => b.daysBeforeBooking - a.daysBeforeBooking
      );

      for (const tier of sortedTiers) {
        if (daysUntilBooking >= tier.daysBeforeBooking) {
          chargePercentage = tier.chargePercentage;
          break;
        }
      }

      // Calculate cancellation fee based on total price, but limited to deposit amount
      const theoreticalFee = (booking.totalPrice * chargePercentage) / 100;
      const cancellationFee = Math.min(theoreticalFee, depositAmount);
      const refundAmount = depositAmount - cancellationFee;

      let message = "";
      if (chargePercentage === 0) {
        message =
          "<strong>Aucun frais appliqué.</strong> L'empreinte bancaire sera <strong>annulée intégralement</strong>.";
      } else if (chargePercentage === 100) {
        message = `<strong>Annulation tardive.</strong> L'empreinte bancaire de <strong>${depositAmount.toFixed(
          2
        )}€</strong> sera <strong>prélevée intégralement</strong>.`;
      } else {
        message = `Selon nos <a href='/cgu#article6' target='_blank' rel='noopener noreferrer' style='color: inherit; text-decoration: underline;'>conditions générales de vente</a>, <strong>${cancellationFee.toFixed(
          2
        )}€</strong> sera <strong>prélevé</strong> (${chargePercentage}% du montant total).`;
      }

      setPreview({
        daysUntilBooking,
        chargePercentage,
        cancellationFee,
        refundAmount,
        message,
        depositAmount,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du calcul des frais"
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  // Handle modal show
  const handleShow = () => {
    setSuccess(null);
    setError(null);
    setPreview(null);
    loadCancellationPreview();
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (!booking) return;

    // SECURITY CHECK: Double-check date before API call
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      setError(
        "Impossible d'annuler une réservation passée. L'empreinte bancaire a déjà été traitée."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${booking._id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setSuccess(data.data.cancellationMessage);

      // Wait 5 seconds to show success message, then refresh and close
      setTimeout(() => {
        // Call onCancelled callback to refresh the list
        if (onCancelled) {
          onCancelled();
        }

        // Close modal after a short delay
        setTimeout(() => {
          onHide();
          setSuccess(null);
        }, 500);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const spaceName = booking.space?.name || booking.spaceType;
  const bookingDate = new Date(booking.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      show={show}
      onHide={onHide}
      onShow={handleShow}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="text-white">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Annuler la réservation
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
                <p className="text-muted mb-2">
                  <strong>Espace :</strong> {spaceName}
                </p>
                <p className="text-muted mb-2">
                  <strong>Date :</strong> {bookingDate}
                </p>
                {booking.startTime && booking.endTime && (
                  <p className="text-muted mb-2">
                    <strong>Horaire :</strong> {booking.startTime} -{" "}
                    {booking.endTime}
                  </p>
                )}
                <p className="text-muted mb-0">
                  <strong>Montant :</strong> {booking.totalPrice.toFixed(2)}€
                </p>
              </div>
            </div>

            {loadingPreview && (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Calcul des frais...</p>
              </div>
            )}

            {preview && !loadingPreview && (
              <>
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Conditions d'annulation</h6>
                  <div
                    className={`p-3 rounded border-start border-4 ${
                      preview.chargePercentage === 0
                        ? "bg-success bg-opacity-10 border-success"
                        : preview.chargePercentage === 100
                        ? "bg-danger bg-opacity-10 border-danger"
                        : "bg-warning bg-opacity-10 border-warning"
                    }`}
                  >
                    {booking.status === "pending" ? (
                      // For pending bookings, show only the message
                      <>
                        <p className="text-muted mb-0">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: preview.message,
                            }}
                          />
                        </p>
                        <p className="text-muted mb-0 mt-3">
                          Vous vous êtes trompé ? Contactez-nous par email{" "}
                          <ProtectedEmail
                            user="strasbourg"
                            domain="coworkingcafe.fr"
                            className="text-muted"
                          />
                        </p>
                      </>
                    ) : (
                      // For confirmed bookings, show details
                      <>
                        <p className="text-muted mb-2">
                          <strong>Empreinte bancaire :</strong>{" "}
                          {preview.depositAmount?.toFixed(2) ||
                            booking.totalPrice.toFixed(2)}
                          €
                        </p>
                        <p className="text-muted mb-2">
                          <strong>Temps restant :</strong>{" "}
                          {preview.daysUntilBooking} jour
                          {preview.daysUntilBooking > 1 ? "s" : ""}
                        </p>
                        {preview.cancellationFee > 0 && (
                          <p className="text-muted mb-2">
                            <strong>Montant prélevé :</strong>{" "}
                            {preview.cancellationFee.toFixed(2)}€ (
                            {preview.chargePercentage}%)
                          </p>
                        )}
                        {preview.refundAmount > 0 && (
                          <p className="text-muted mb-2">
                            <strong>Montant non prélevé :</strong>{" "}
                            {preview.refundAmount.toFixed(2)}€
                          </p>
                        )}
                        <p className="text-muted mb-0 mt-3">
                          <i
                            className={`bi ${
                              preview.chargePercentage === 0
                                ? "bi-check-circle-fill text-success"
                                : preview.chargePercentage === 100
                                ? "bi-exclamation-circle-fill text-danger"
                                : "bi-info-circle-fill text-warning"
                            } me-2`}
                          ></i>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: preview.message,
                            }}
                          />
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <Alert variant="warning" className="mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Attention :</strong> Cette action est irréversible.
                  Êtes-vous sûr de vouloir annuler cette réservation ?
                </Alert>
              </>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        {!success ? (
          <>
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Retour
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={loading || loadingPreview || !preview}
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
                  Annulation...
                </>
              ) : (
                <>
                  <i className="bi bi-x-circle me-2"></i>
                  Confirmer l'annulation
                </>
              )}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onHide}>
            Fermer
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
