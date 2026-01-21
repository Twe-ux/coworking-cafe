/**
 * BookingDetailCard Component
 * Card détaillée pour l'affichage complet d'une réservation
 */

import Image from 'next/image';
import type { ReservationDetails } from '@/types';

interface BookingDetailCardProps {
  booking: ReservationDetails;
  spaceImage?: string;
}

export function BookingDetailCard({ booking, spaceImage }: BookingDetailCardProps) {
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'booking-detail__status--confirmed';
      case 'completed':
        return 'booking-detail__status--completed';
      case 'cancelled':
        return 'booking-detail__status--cancelled';
      case 'pending':
        return 'booking-detail__status--pending';
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
        return 'En attente de paiement';
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

  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="booking-detail">
      <div className="booking-detail__header">
        <div className="booking-detail__header-content">
          <h2 className="booking-detail__title">{booking.spaceName}</h2>
          <span className={`booking-detail__status ${getStatusBadgeClass(booking.status)}`}>
            {getStatusLabel(booking.status)}
          </span>
        </div>

        {spaceImage && (
          <div className="booking-detail__image">
            <Image
              src={spaceImage}
              alt={booking.spaceName}
              width={400}
              height={250}
              className="booking-detail__image-img"
            />
          </div>
        )}
      </div>

      <div className="booking-detail__body">
        <div className="booking-detail__section">
          <h3 className="booking-detail__section-title">Informations de réservation</h3>

          <dl className="booking-detail__info-list">
            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Date</dt>
              <dd className="booking-detail__info-value">{formatDate(booking.date)}</dd>
            </div>

            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Heure de début</dt>
              <dd className="booking-detail__info-value">{booking.startTime}</dd>
            </div>

            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Heure de fin</dt>
              <dd className="booking-detail__info-value">{booking.endTime}</dd>
            </div>

            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Nombre de personnes</dt>
              <dd className="booking-detail__info-value">
                {booking.numberOfPeople} {booking.numberOfPeople > 1 ? 'personnes' : 'personne'}
              </dd>
            </div>

            {booking.specialRequests && (
              <div className="booking-detail__info-item booking-detail__info-item--full">
                <dt className="booking-detail__info-label">Demandes spéciales</dt>
                <dd className="booking-detail__info-value">{booking.specialRequests}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="booking-detail__section">
          <h3 className="booking-detail__section-title">Détails du paiement</h3>

          <dl className="booking-detail__info-list">
            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Prix total</dt>
              <dd className="booking-detail__info-value booking-detail__price">
                {booking.totalPrice.toFixed(2)}€
              </dd>
            </div>

            {booking.promoCode && (
              <div className="booking-detail__info-item">
                <dt className="booking-detail__info-label">Code promo appliqué</dt>
                <dd className="booking-detail__info-value booking-detail__promo">
                  {booking.promoCode}
                </dd>
              </div>
            )}

            {booking.paymentIntentId && (
              <div className="booking-detail__info-item">
                <dt className="booking-detail__info-label">Référence de paiement</dt>
                <dd className="booking-detail__info-value booking-detail__reference">
                  {booking.paymentIntentId}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="booking-detail__section">
          <h3 className="booking-detail__section-title">Informations système</h3>

          <dl className="booking-detail__info-list">
            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Référence de réservation</dt>
              <dd className="booking-detail__info-value booking-detail__reference">
                {booking.id}
              </dd>
            </div>

            <div className="booking-detail__info-item">
              <dt className="booking-detail__info-label">Date de réservation</dt>
              <dd className="booking-detail__info-value">{formatDateTime(booking.createdAt)}</dd>
            </div>

            {booking.updatedAt !== booking.createdAt && (
              <div className="booking-detail__info-item">
                <dt className="booking-detail__info-label">Dernière modification</dt>
                <dd className="booking-detail__info-value">{formatDateTime(booking.updatedAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </article>
  );
}
