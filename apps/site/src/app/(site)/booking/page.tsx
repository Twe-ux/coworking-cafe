/**
 * Booking Page - apps/site
 * Step 1: Sélection espace + formulaire réservation
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBookingForm } from '@/hooks/useBookingForm';
import { BookingForm } from '@/components/booking/BookingForm';
import { apiClient } from '@/lib/utils/api-client';
import type { SpaceData } from '@/types';

interface DisplaySpace {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  capacity: number;
  imageUrl?: string;
  description?: string;
  features?: string[];
}

export default function BookingPage() {
  const router = useRouter();
  const { formData, errors, loading, handleChange, handleSubmit } = useBookingForm();
  const [spaces, setSpaces] = useState<DisplaySpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setLoadingSpaces(true);
      const response = await apiClient.get<SpaceData[]>('/spaces');

      if (response.success && response.data) {
        const displaySpaces: DisplaySpace[] = response.data.map((space) => ({
          id: space._id,
          name: space.name,
          type: space.type,
          pricePerHour: space.pricePerHour,
          capacity: space.capacity,
          imageUrl: space.images?.[0],
          description: space.description,
          features: space.amenities,
        }));
        setSpaces(displaySpaces);
      }
    } catch (err) {
      console.error('Error fetching spaces:', err);
    } finally {
      setLoadingSpaces(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await handleSubmit();

    if (result.success && result.data) {
      // Rediriger vers page confirmation avec query params
      const params = new URLSearchParams({
        spaceId: formData.spaceId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfPeople: formData.numberOfPeople.toString(),
        promoCode: formData.promoCode || '',
      });

      router.push(`/booking/confirmation?${params.toString()}`);
    }
  };

  if (loadingSpaces) {
    return (
      <main className="page-booking">
        <div className="page-booking__loading">
          <div className="spinner" />
          <p>Chargement des espaces...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-booking">
      <div className="page-booking__container">
        <div className="page-booking__header">
          <h1 className="page-booking__title">Réserver un espace</h1>
          <p className="page-booking__subtitle">
            Quel espace souhaitez-vous réserver ?
          </p>
        </div>

        {/* Grille des espaces disponibles */}
        <div className="page-booking__spaces">
          {spaces.map((space) => (
            <div
              key={space.id}
              className={`space-card ${
                formData.spaceId === space.id ? 'space-card--selected' : ''
              }`}
              onClick={() => handleChange('spaceId', space.id)}
            >
              {space.imageUrl ? (
                <div className="space-card__image">
                  <Image
                    src={space.imageUrl}
                    alt={space.name}
                    width={400}
                    height={250}
                    quality={85}
                  />
                </div>
              ) : (
                <div className="space-card__placeholder">
                  <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z" />
                  </svg>
                </div>
              )}

              <div className="space-card__content">
                <h3 className="space-card__name">{space.name}</h3>
                <p className="space-card__type">{space.type}</p>

                <div className="space-card__info">
                  <div className="space-card__info-item">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    </svg>
                    <span>Jusqu'à {space.capacity} pers.</span>
                  </div>

                  <div className="space-card__info-item">
                    <span className="space-card__price">{space.pricePerHour}€/h</span>
                  </div>
                </div>

                {space.features && space.features.length > 0 && (
                  <div className="space-card__features">
                    {space.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="space-card__feature">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formData.spaceId === space.id && (
                <div className="space-card__check">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Formulaire de réservation */}
        {formData.spaceId && (
          <div className="page-booking__form-section">
            <BookingForm
              formData={formData}
              errors={errors}
              loading={loading}
              spaces={spaces.map((s) => ({
                id: s.id,
                name: s.name,
                type: s.type,
                pricePerHour: s.pricePerHour,
              }))}
              onFieldChange={handleChange}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}
      </div>
    </main>
  );
}
