/**
 * PriceDisplay Component - apps/site
 * Affichage du prix calculé avec animation
 */

'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils/format-price';
import type { PromoDetails } from '@/types';

interface PriceDisplayProps {
  basePrice: number;
  discount?: number;
  totalPrice: number;
  hours: number;
  promo?: PromoDetails | null;
  className?: string;
}

export function PriceDisplay({
  basePrice,
  discount = 0,
  totalPrice,
  hours,
  promo,
  className = '',
}: PriceDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const hasDiscount = discount > 0;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  return (
    <div className={`price-display ${className}`}>
      <div className="price-display__header">
        <h3 className="price-display__title">Prix de votre réservation</h3>
        <span className="price-display__duration">
          {hours} {hours > 1 ? 'heures' : 'heure'}
        </span>
      </div>

      <div className="price-display__breakdown">
        <div className="price-display__item">
          <span className="price-display__item-label">Prix de base</span>
          <span className="price-display__item-value">{formatPrice(basePrice)}</span>
        </div>

        {hasDiscount && (
          <div className="price-display__item price-display__item--discount">
            <span className="price-display__item-label">
              Réduction
              {promo && (
                <span className="price-display__promo-badge">{promo.code}</span>
              )}
            </span>
            <span className="price-display__item-value price-display__item-value--discount">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        {promo && (
          <div className="price-display__promo-info">
            <svg
              className="price-display__promo-icon"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            <span className="price-display__promo-text">{promo.description}</span>
          </div>
        )}
      </div>

      <div className="price-display__divider" />

      <div
        className={`price-display__total ${
          isAnimating ? 'price-display__total--animating' : ''
        } ${hasDiscount ? 'price-display__total--discounted' : ''}`}
      >
        <span className="price-display__total-label">Total à payer</span>
        <span className="price-display__total-value">{formatPrice(totalPrice)}</span>
      </div>

      {hasDiscount && (
        <div className="price-display__savings">
          Vous économisez {formatPrice(discount)}
        </div>
      )}

      <div className="price-display__info">
        <svg
          className="price-display__info-icon"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
        </svg>
        <span className="price-display__info-text">
          Paiement sécurisé par Stripe
        </span>
      </div>
    </div>
  );
}
