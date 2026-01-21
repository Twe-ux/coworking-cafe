/**
 * CancelBookingModal Component
 * Modal de confirmation pour l'annulation d'une réservation
 */

'use client';

import { useState } from 'react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingId: string;
  spaceName: string;
  date: string;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  spaceName,
  date,
}: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal cancel-modal">
        <div className="modal__header">
          <h2 className="modal__title">Confirmer l'annulation</h2>
          {!loading && (
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Fermer"
            >
              ×
            </button>
          )}
        </div>

        <div className="modal__body">
          <div className="cancel-modal__warning">
            <svg
              className="cancel-modal__warning-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <p className="cancel-modal__message">
            Êtes-vous sûr de vouloir annuler cette réservation ?
          </p>

          <div className="cancel-modal__details">
            <dl className="cancel-modal__info">
              <div className="cancel-modal__info-item">
                <dt>Espace</dt>
                <dd>{spaceName}</dd>
              </div>
              <div className="cancel-modal__info-item">
                <dt>Date</dt>
                <dd>{formatDate(date)}</dd>
              </div>
              <div className="cancel-modal__info-item">
                <dt>Référence</dt>
                <dd className="cancel-modal__reference">{bookingId}</dd>
              </div>
            </dl>
          </div>

          <div className="cancel-modal__refund-notice">
            <p>
              <strong>Important :</strong> Le remboursement sera traité automatiquement et
              apparaîtra sur votre compte sous 5 à 10 jours ouvrés selon votre banque.
            </p>
          </div>

          {error && (
            <div className="cancel-modal__error" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onClose}
            disabled={loading}
          >
            Retour
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm"></span>
                Annulation en cours...
              </>
            ) : (
              'Confirmer l\'annulation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
