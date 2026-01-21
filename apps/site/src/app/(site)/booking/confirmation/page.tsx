/**
 * Booking Confirmation Page - apps/site
 * Step 2: Récapitulatif + validation avant paiement
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { PriceDisplay } from '@/components/booking/PriceDisplay';
import { apiClient } from '@/lib/utils/api-client';
import type { CalculatePriceResponse, SpaceData } from '@/types';

function ConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CalculatePriceResponse | null>(null);
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, [searchParams]);

  const fetchPricing = async () => {
    try {
      setLoading(true);

      // 1. Récupérer données depuis query params
      const spaceId = searchParams.get('spaceId');
      const date = searchParams.get('date');
      const startTime = searchParams.get('startTime');
      const endTime = searchParams.get('endTime');
      const numberOfPeople = parseInt(searchParams.get('numberOfPeople') || '1');
      const promoCode = searchParams.get('promoCode') || undefined;

      if (!spaceId || !date || !startTime || !endTime) {
        setError('Données manquantes');
        return;
      }

      // 2. Fetch space info
      const spaceResponse = await apiClient.get<SpaceData>(`/spaces/${spaceId}`);
      if (spaceResponse.success && spaceResponse.data) {
        setSpace(spaceResponse.data);
      }

      // 3. Calculer le prix
      const response = await apiClient.post<CalculatePriceResponse>(
        '/booking/calculate',
        {
          spaceId,
          date,
          startTime,
          endTime,
          numberOfPeople,
          promoCode,
        }
      );

      if (!response.success || !response.data) {
        setError(response.error || 'Erreur lors du calcul');
        return;
      }

      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!data) return;

    setProcessing(true);

    try {
      // Créer Payment Intent
      const response = await apiClient.post<{
        clientSecret: string;
        bookingId: string;
      }>('/booking/create-payment-intent', {
        spaceId: data.space.id,
        date: data.booking.date,
        startTime: data.booking.startTime,
        endTime: data.booking.endTime,
        numberOfPeople: data.booking.numberOfPeople,
        totalPrice: data.pricing.totalPrice,
        promoCode: data.pricing.promo?.code,
      });

      if (!response.success || !response.data) {
        setError(response.error || 'Erreur lors de la création du paiement');
        return;
      }

      // Rediriger vers page checkout
      router.push(
        `/booking/checkout?clientSecret=${response.data.clientSecret}&bookingId=${response.data.bookingId}`
      );
    } catch (err) {
      setError('Erreur lors de la création du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="page-booking-confirmation">
        <div className="page-booking-confirmation__loading">
          <div className="spinner" />
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="page-booking-confirmation">
        <div className="page-booking-confirmation__error">
          <div className="alert alert--error">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <p>{error || 'Données invalides'}</p>
          </div>
          <button onClick={() => router.push('/booking')} className="btn btn--outline">
            Retour à la réservation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-booking-confirmation">
      <div className="page-booking-confirmation__container">
        <div className="page-booking-confirmation__header">
          <button
            onClick={() => router.back()}
            className="page-booking-confirmation__back"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Retour
          </button>
          <h1 className="page-booking-confirmation__title">
            Confirmation de réservation
          </h1>
        </div>

        <div className="page-booking-confirmation__content">
          {/* Colonne gauche: Récapitulatif */}
          <div className="page-booking-confirmation__summary">
            <BookingSummary
              spaceName={space?.name || data.space.name}
              date={data.booking.date}
              startTime={data.booking.startTime}
              endTime={data.booking.endTime}
              numberOfPeople={data.booking.numberOfPeople}
              hours={data.booking.hours}
              basePrice={data.pricing.basePrice}
              discount={data.pricing.discount}
              totalPrice={data.pricing.totalPrice}
              promo={data.pricing.promo}
            />
          </div>

          {/* Colonne droite: Prix + Actions */}
          <div className="page-booking-confirmation__sidebar">
            <PriceDisplay
              basePrice={data.pricing.basePrice}
              discount={data.pricing.discount}
              totalPrice={data.pricing.totalPrice}
              hours={data.booking.hours}
              promo={data.pricing.promo}
            />

            <div className="page-booking-confirmation__actions">
              <button
                onClick={() => router.back()}
                className="btn btn--outline"
                disabled={processing}
              >
                Modifier
              </button>
              <button
                onClick={handleProceedToPayment}
                className="btn btn--primary"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner spinner--sm" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z" />
                    </svg>
                    Procéder au paiement
                  </>
                )}
              </button>
            </div>

            <div className="page-booking-confirmation__security">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
              </svg>
              <span>Paiement 100% sécurisé par Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="page-booking-confirmation">
          <div className="page-booking-confirmation__loading">
            <div className="spinner" />
            <p>Chargement...</p>
          </div>
        </main>
      }
    >
      <ConfirmationPageContent />
    </Suspense>
  );
}
