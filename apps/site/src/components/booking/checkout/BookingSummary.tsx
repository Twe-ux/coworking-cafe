'use client';

interface Booking {
  _id: string;
  spaceType: string;
  date: string;
  startTime: string;
  endTime: string;
  numberOfPeople: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  requiresPayment: boolean;
  reservationType?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

interface SpaceConfig {
  name: string;
  spaceType: string;
}

interface BookingSummaryProps {
  booking: Booking;
  spaceConfig: SpaceConfig | null;
}

export default function BookingSummary({ booking, spaceConfig }: BookingSummaryProps) {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    return time;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'desk': 'Bureau',
      'meeting-room': 'Salle de réunion',
      'private-office': 'Bureau privé',
      'event-space': 'Espace événement',
      'open-space': 'Open-space',
      'salle-verriere': 'Salle Verrière',
      'salle-etage': 'Salle Étage',
      'evenementiel': 'Événementiel',
    };
    return labels[type] || type;
  };

  return (
    <div className="booking-card mb-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="bi bi-receipt text-success" style={{ fontSize: "1.125rem" }}></i>
        <h2 className="h6 mb-0 fw-semibold">Récapitulatif de la réservation</h2>
      </div>

      <div className="summary-row mb-3">
        <div className="summary-label">Espace</div>
        <div className="summary-value">
          <strong>{spaceConfig?.name || 'Espace'}</strong>
          <span className="badge bg-success ms-2" style={{ fontSize: "0.75rem" }}>
            {getTypeLabel(booking.spaceType)}
          </span>
        </div>
      </div>

      <div className="summary-row mb-3">
        <div className="summary-label">Date</div>
        <div className="summary-value">
          <i className="bi bi-calendar me-2 text-success"></i>
          {formatDate(booking.date)}
        </div>
      </div>

      <div className="summary-row mb-3">
        <div className="summary-label">{booking.reservationType === 'daily' ? 'Arrivée' : 'Horaire'}</div>
        <div className="summary-value">
          <i className="bi bi-clock me-2 text-success"></i>
          {booking.reservationType === 'daily'
            ? `Journée complète à partir de ${formatTime(booking.startTime)}`
            : `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
        </div>
      </div>

      <div className="summary-row mb-4">
        <div className="summary-label">Personnes</div>
        <div className="summary-value">
          <i className="bi bi-people me-2 text-success"></i>
          {booking.numberOfPeople} {booking.numberOfPeople > 1 ? 'personnes' : 'personne'}
        </div>
      </div>

      <div className="price-divider mb-4"></div>

      <div className="summary-row">
        <div className="summary-label" style={{ fontSize: "0.875rem", fontWeight: "700" }}>
          Total à payer
        </div>
        <div className="summary-value">
          <h4 className="text-success mb-0" style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {booking.totalPrice.toFixed(2)}€
          </h4>
        </div>
      </div>
    </div>
  );
}
