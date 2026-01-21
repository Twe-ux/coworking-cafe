/**
 * Booking Success Page - apps/site
 * Step 4: Confirmation de réservation après paiement réussi
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/utils/api-client';
import { formatDateFr } from '@/lib/utils/format-date';
import { formatPrice } from '@/lib/utils/format-price';
import type { BookingData } from '@/types';

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('ID de réservation manquant');
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const response = await apiClient.get<BookingData>(`/booking/${bookingId}`);

      if (!response.success || !response.data) {
        setError(response.error || 'Réservation introuvable');
        return;
      }

      setBooking(response.data);
    } catch (err) {
      setError('Erreur lors du chargement de la réservation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-booking-success">
        <div className="page-booking-success__loading">
          <div className="spinner spinner--lg" />
          <p>Chargement de votre réservation...</p>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="page-booking-success">
        <div className="page-booking-success__error">
          <div className="alert alert--error">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <p>{error || 'Réservation introuvable'}</p>
          </div>
          <button onClick={() => router.push('/booking')} className="btn btn--outline">
            Nouvelle réservation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-booking-success">
      <div className="page-booking-success__container">
        {/* Animation de succès */}
        <div className="page-booking-success__icon">
          <svg
            width="120"
            height="120"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="page-booking-success__check"
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
          </svg>
        </div>

        {/* Message de succès */}
        <div className="page-booking-success__header">
          <h1 className="page-booking-success__title">Réservation confirmée !</h1>
          <p className="page-booking-success__subtitle">
            Votre réservation a été confirmée avec succès. Un email de confirmation vous a
            été envoyé.
          </p>
        </div>

        {/* Détails de la réservation */}
        <div className="page-booking-success__details">
          <h2 className="page-booking-success__details-title">
            Détails de votre réservation
          </h2>

          <dl className="page-booking-success__details-list">
            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z" />
                </svg>
                Espace
              </dt>
              <dd className="page-booking-success__detail-value">
                {booking.spaceId?.name || 'Espace'}
              </dd>
            </div>

            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                </svg>
                Date
              </dt>
              <dd className="page-booking-success__detail-value">
                {formatDateFr(booking.date)}
              </dd>
            </div>

            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                </svg>
                Horaire
              </dt>
              <dd className="page-booking-success__detail-value">
                {booking.startTime} - {booking.endTime}
              </dd>
            </div>

            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                </svg>
                Personnes
              </dt>
              <dd className="page-booking-success__detail-value">
                {booking.numberOfPeople}{' '}
                {booking.numberOfPeople > 1 ? 'personnes' : 'personne'}
              </dd>
            </div>

            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5.5 1a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5z" />
                </svg>
                Total payé
              </dt>
              <dd className="page-booking-success__detail-value page-booking-success__detail-value--price">
                {formatPrice(booking.totalPrice)}
              </dd>
            </div>

            <div className="page-booking-success__detail">
              <dt className="page-booking-success__detail-label">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z" />
                  <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z" />
                </svg>
                Référence
              </dt>
              <dd className="page-booking-success__detail-value page-booking-success__detail-value--mono">
                {booking._id}
              </dd>
            </div>
          </dl>
        </div>

        {/* Informations importantes */}
        <div className="page-booking-success__info">
          <div className="page-booking-success__info-header">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            <h3>Informations importantes</h3>
          </div>
          <ul className="page-booking-success__info-list">
            <li>Veuillez arriver 5 minutes avant l'heure de début de votre réservation</li>
            <li>Présentez votre numéro de confirmation à la réception</li>
            <li>
              En cas d'annulation, veuillez nous prévenir au moins 24 heures à l'avance
            </li>
            <li>Un email de confirmation a été envoyé avec tous les détails</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="page-booking-success__actions">
          <Link href="/dashboard/bookings" className="btn btn--primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 14.5V7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v2h6V4H1zm8 0v2h6V4H9zm5 3H9v8h4.5a.5.5 0 0 0 .5-.5V7zm-7 8V7H2v7.5a.5.5 0 0 0 .5.5H7z" />
            </svg>
            Voir mes réservations
          </Link>
          <Link href="/" className="btn btn--outline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="page-booking-success">
          <div className="page-booking-success__loading">
            <div className="spinner spinner--lg" />
            <p>Chargement...</p>
          </div>
        </main>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
