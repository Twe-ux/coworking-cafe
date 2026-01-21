/**
 * Bookings List Page
 * Page de liste des réservations avec onglets filtres
 */

'use client';

import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/dashboard/BookingCard';
import { CancelBookingModal } from '@/components/dashboard/CancelBookingModal';

type TabType = 'upcoming' | 'past' | 'cancelled';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    id: string;
    spaceName: string;
    date: string;
  } | null>(null);

  const { bookings, loading, error, page, totalPages, hasNext, hasPrevious, goToPage, refresh } =
    useBookings({
      status: activeTab,
      pageSize: 10,
    });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleCancelClick = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setSelectedBooking({
        id: booking.id,
        spaceName: booking.spaceName,
        date: booking.date,
      });
      setCancelModalOpen(true);
    }
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    const response = await fetch(`/api/booking/${selectedBooking.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Échec de l\'annulation');
    }

    await refresh();
    setCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCloseModal = () => {
    setCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const getEmptyStateMessage = (tab: TabType): string => {
    switch (tab) {
      case 'upcoming':
        return 'Vous n\'avez aucune réservation à venir. Réservez un espace dès maintenant !';
      case 'past':
        return 'Vous n\'avez aucune réservation passée.';
      case 'cancelled':
        return 'Vous n\'avez aucune réservation annulée.';
      default:
        return 'Aucune réservation trouvée.';
    }
  };

  return (
    <main className="page-bookings">
      <div className="page-bookings__header">
        <h1 className="page-bookings__title">Mes Réservations</h1>
        <p className="page-bookings__subtitle">
          Consultez et gérez toutes vos réservations d'espaces
        </p>
      </div>

      <div className="page-bookings__tabs">
        <button
          className={`page-bookings__tab ${activeTab === 'upcoming' ? 'page-bookings__tab--active' : ''}`}
          onClick={() => handleTabChange('upcoming')}
          type="button"
        >
          Prochaines
        </button>
        <button
          className={`page-bookings__tab ${activeTab === 'past' ? 'page-bookings__tab--active' : ''}`}
          onClick={() => handleTabChange('past')}
          type="button"
        >
          Passées
        </button>
        <button
          className={`page-bookings__tab ${activeTab === 'cancelled' ? 'page-bookings__tab--active' : ''}`}
          onClick={() => handleTabChange('cancelled')}
          type="button"
        >
          Annulées
        </button>
      </div>

      <div className="page-bookings__content">
        {loading ? (
          <div className="page-bookings__loading">
            <div className="spinner"></div>
            <p>Chargement des réservations...</p>
          </div>
        ) : error ? (
          <div className="page-bookings__error" role="alert">
            <p>{error}</p>
            <button className="btn btn--primary" onClick={refresh} type="button">
              Réessayer
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="page-bookings__empty">
            <svg
              className="page-bookings__empty-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="page-bookings__empty-message">{getEmptyStateMessage(activeTab)}</p>
            {activeTab === 'upcoming' && (
              <a href="/booking" className="btn btn--primary">
                Réserver un espace
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="page-bookings__list">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="page-bookings__pagination">
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={!hasPrevious}
                  type="button"
                >
                  Précédent
                </button>

                <span className="page-bookings__pagination-info">
                  Page {page} sur {totalPages}
                </span>

                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasNext}
                  type="button"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedBooking && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleCancelConfirm}
          bookingId={selectedBooking.id}
          spaceName={selectedBooking.spaceName}
          date={selectedBooking.date}
        />
      )}
    </main>
  );
}
