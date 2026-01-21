/**
 * BookingSummary Component - apps/site
 * Récapitulatif d'une réservation
 */

'use client';

import { formatPrice } from '@/lib/utils/format-price';
import { formatDateFr } from '@/lib/utils/format-date';
import type { PromoDetails } from '@/types';

interface BookingSummaryProps {
  spaceName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfPeople: number;
  hours: number;
  basePrice: number;
  discount?: number;
  totalPrice: number;
  promo?: PromoDetails | null;
}

export function BookingSummary({
  spaceName,
  date,
  startTime,
  endTime,
  numberOfPeople,
  hours,
  basePrice,
  discount = 0,
  totalPrice,
  promo,
}: BookingSummaryProps) {
  const hasDiscount = discount > 0;

  return (
    <div className="booking-summary">
      <div className="booking-summary__header">
        <h3 className="booking-summary__title">Récapitulatif</h3>
      </div>

      <div className="booking-summary__body">
        <dl className="booking-summary__details">
          <div className="booking-summary__detail">
            <dt className="booking-summary__detail-label">Espace</dt>
            <dd className="booking-summary__detail-value">{spaceName}</dd>
          </div>

          <div className="booking-summary__detail">
            <dt className="booking-summary__detail-label">Date</dt>
            <dd className="booking-summary__detail-value">{formatDateFr(date)}</dd>
          </div>

          <div className="booking-summary__detail">
            <dt className="booking-summary__detail-label">Horaire</dt>
            <dd className="booking-summary__detail-value">
              {startTime} - {endTime}
            </dd>
          </div>

          <div className="booking-summary__detail">
            <dt className="booking-summary__detail-label">Durée</dt>
            <dd className="booking-summary__detail-value">
              {hours} {hours > 1 ? 'heures' : 'heure'}
            </dd>
          </div>

          <div className="booking-summary__detail">
            <dt className="booking-summary__detail-label">Nombre de personnes</dt>
            <dd className="booking-summary__detail-value">{numberOfPeople}</dd>
          </div>
        </dl>

        <div className="booking-summary__divider" />

        <dl className="booking-summary__pricing">
          <div className="booking-summary__pricing-item">
            <dt className="booking-summary__pricing-label">Prix de base</dt>
            <dd className="booking-summary__pricing-value">
              {formatPrice(basePrice)}
            </dd>
          </div>

          {hasDiscount && promo && (
            <div className="booking-summary__pricing-item booking-summary__pricing-item--discount">
              <dt className="booking-summary__pricing-label">
                Réduction
                <span className="booking-summary__promo-code">
                  {promo.code}
                </span>
              </dt>
              <dd className="booking-summary__pricing-value booking-summary__pricing-value--discount">
                -{formatPrice(discount)}
              </dd>
            </div>
          )}

          <div className="booking-summary__divider" />

          <div className="booking-summary__pricing-item booking-summary__pricing-item--total">
            <dt className="booking-summary__pricing-label">Total à payer</dt>
            <dd className="booking-summary__pricing-value booking-summary__pricing-value--total">
              {formatPrice(totalPrice)}
            </dd>
          </div>
        </dl>

        {promo && (
          <div className="booking-summary__promo-info">
            <svg
              className="booking-summary__promo-icon"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </svg>
            <span className="booking-summary__promo-text">{promo.description}</span>
          </div>
        )}
      </div>
    </div>
  );
}
