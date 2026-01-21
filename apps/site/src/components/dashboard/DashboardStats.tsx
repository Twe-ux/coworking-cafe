interface BookingData {
  _id: string;
  spaceId: {
    name: string;
    type: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
}

interface DashboardStatsProps {
  totalBookings: number;
  thisMonthBookings: number;
  totalSpent: number;
  nextBooking: BookingData | null;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

function StatCard({ icon, label, value, variant }: StatCardProps) {
  return (
    <div className={`dashboard-stats__card dashboard-stats__card--${variant}`}>
      <div className="dashboard-stats__card-icon">{icon}</div>
      <div className="dashboard-stats__card-content">
        <p className="dashboard-stats__card-label">{label}</p>
        <p className="dashboard-stats__card-value">{value}</p>
      </div>
    </div>
  );
}

export function DashboardStats({
  totalBookings,
  thisMonthBookings,
  totalSpent,
  nextBooking
}: DashboardStatsProps) {
  const formatNextBooking = (booking: BookingData | null): string => {
    if (!booking) {
      return 'Aucune';
    }

    const date = new Date(booking.date);
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });

    return `${dateStr} à ${booking.startTime}`;
  };

  return (
    <div className="dashboard-stats">
      <StatCard
        icon="📊"
        label="Réservations totales"
        value={totalBookings}
        variant="primary"
      />
      <StatCard
        icon="📅"
        label="Ce mois-ci"
        value={thisMonthBookings}
        variant="info"
      />
      <StatCard
        icon="💰"
        label="Total dépensé"
        value={`${totalSpent.toFixed(2)}€`}
        variant="success"
      />
      <StatCard
        icon="⏰"
        label="Prochaine réservation"
        value={formatNextBooking(nextBooking)}
        variant="warning"
      />
    </div>
  );
}
