/**
 * SpaceCard Component - apps/site
 * Card pour afficher un espace coworking
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/format-price';

interface SpaceCardProps {
  space: {
    id: string;
    name: string;
    type: 'open-space' | 'meeting-room' | 'private-office';
    capacity: number;
    pricePerHour: number;
    images: string[];
    amenities: string[];
  };
}

const TYPE_LABELS: Record<string, string> = {
  'open-space': 'Open Space',
  'meeting-room': 'Salle de Réunion',
  'private-office': 'Bureau Privé',
};

const TYPE_COLORS: Record<string, string> = {
  'open-space': 'badge--primary',
  'meeting-room': 'badge--success',
  'private-office': 'badge--warning',
};

export function SpaceCard({ space }: SpaceCardProps) {
  const { id, name, type, capacity, pricePerHour, images, amenities } = space;
  const coverImage = images[0] || '/images/placeholder-space.jpg';
  const visibleAmenities = amenities.slice(0, 3);
  const hasMoreAmenities = amenities.length > 3;

  return (
    <article className="space-card">
      <div className="space-card__image-container">
        <Image
          src={coverImage}
          alt={`${name} - ${TYPE_LABELS[type]}`}
          width={400}
          height={300}
          className="space-card__image"
          loading="lazy"
          quality={85}
        />
        <span className={`space-card__badge badge ${TYPE_COLORS[type]}`}>
          {TYPE_LABELS[type]}
        </span>
      </div>

      <div className="space-card__content">
        <h3 className="space-card__title">{name}</h3>

        <div className="space-card__info">
          <span className="space-card__info-item">
            <svg
              className="space-card__icon"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
            </svg>
            Jusqu'à {capacity} personnes
          </span>
        </div>

        <div className="space-card__amenities">
          {visibleAmenities.map((amenity) => (
            <span key={amenity} className="space-card__amenity">
              {amenity}
            </span>
          ))}
          {hasMoreAmenities && (
            <span className="space-card__amenity space-card__amenity--more">
              +{amenities.length - 3}
            </span>
          )}
        </div>

        <div className="space-card__footer">
          <div className="space-card__price">
            <span className="space-card__price-label">À partir de</span>
            <span className="space-card__price-value">
              {formatPrice(pricePerHour)}/h
            </span>
          </div>

          <Link href={`/booking?spaceId=${id}`} className="btn btn--primary btn--sm">
            Réserver
          </Link>
        </div>
      </div>
    </article>
  );
}
