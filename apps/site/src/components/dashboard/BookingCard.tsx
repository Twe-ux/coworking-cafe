/**
 * BookingCard Component
 * Card d'affichage d'une réservation dans la liste
 */

import Link from 'next/link';
import type { ReservationDetails } from '@/types';

interface BookingCardProps {
  booking: ReservationDetails;
  onCancel?: (bookingId: string) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const isUpcoming = booking.status === 'confirmed' && new Date(booking.date) >= new Date();
  const canCancel = isUpcoming;

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'booking-card__status--confirmed';
      case 'completed':
        return 'booking-card__status--completed';
      case 'cancelled':
        return 'booking-card__status--cancelled';
      case 'pending':
        return 'booking-card__status--pending';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) {
      onCancel(booking.id);
    }
  };

  return (
    <article className="booking-card">
      <div className="booking-card__header">
        <h3 className="booking-card__title">{booking.spaceName}</h3>
        <span className={`booking-card__status ${getStatusBadgeClass(booking.status)}`}>
          {getStatusLabel(booking.status)}
        </span>
      </div>

      <div className="booking-card__body">
        <div className="booking-card__info">
          <div className="booking-card__info-item">
            <span className="booking-card__info-label">Date</span>
            <span className="booking-card__info-value">{formatDate(booking.date)}</span>
          </div>

          <div className="booking-card__info-item">
            <span className="booking-card__info-label">Horaire</span>
            <span className="booking-card__info-value">
              {booking.startTime} - {booking.endTime}
            </span>
          </div>

          <div className="booking-card__info-item">
            <span className="booking-card__info-label">Personnes</span>
            <span className="booking-card__info-value">
              {booking.numberOfPeople} {booking.numberOfPeople > 1 ? 'personnes' : 'personne'}
            </span>
          </div>

          <div className="booking-card__info-item">
            <span className="booking-card__info-label">Prix total</span>
            <span className="booking-card__info-value booking-card__price">
              {booking.totalPrice.toFixed(2)}€
            </span>
          </div>
        </div>
      </div>

      <div className="booking-card__footer">
        <Link href={`/dashboard/bookings/${booking.id}`} className="btn btn--outline btn--sm">
          Voir détails
        </Link>

        {canCancel && (
          <button
            onClick={handleCancelClick}
            className="btn btn--danger btn--sm"
            type="button"
          >
            Annuler
          </button>
        )}
      </div>
    </article>
  );
}
