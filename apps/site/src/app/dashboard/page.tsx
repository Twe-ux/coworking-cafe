import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord | CoworKing Café',
  description: 'Gérez vos réservations et votre compte',
  robots: {
    index: false,
    follow: false
  }
};

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

interface StatsData {
  totalBookings: number;
  thisMonthBookings: number;
  totalSpent: number;
  nextBooking: BookingData | null;
}

async function getStats(userId: string): Promise<StatsData> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/user/stats?userId=${userId}`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return {
        totalBookings: 0,
        thisMonthBookings: 0,
        totalSpent: 0,
        nextBooking: null
      };
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalBookings: 0,
      thisMonthBookings: 0,
      totalSpent: 0,
      nextBooking: null
    };
  }
}

async function getRecentBookings(userId: string): Promise<BookingData[]> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/user/bookings?userId=${userId}&limit=5`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    return null;
  }

  const stats = await getStats(session.user.id);
  const recentBookings = await getRecentBookings(session.user.id);

  return (
    <div className="dashboard__overview">
      <header className="dashboard__header">
        <div className="dashboard__header-content">
          <h1>Bonjour, {session.user.name}</h1>
          <p className="dashboard__header-subtitle">
            Bienvenue sur votre tableau de bord
          </p>
        </div>
        <Link href="/booking">
          <Button variant="primary" size="lg">
            Réserver un espace
          </Button>
        </Link>
      </header>

      <DashboardStats
        totalBookings={stats.totalBookings}
        thisMonthBookings={stats.thisMonthBookings}
        totalSpent={stats.totalSpent}
        nextBooking={stats.nextBooking}
      />

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Mes dernières réservations</h2>
          <Link href="/dashboard/bookings" className="dashboard__section-link">
            Voir tout
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="dashboard__empty">
            <p>Vous n'avez pas encore de réservation</p>
            <Link href="/booking">
              <Button variant="primary">
                Faire ma première réservation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="dashboard__bookings-list">
            {recentBookings.map((booking) => (
              <Link
                key={booking._id}
                href={`/dashboard/bookings/${booking._id}`}
                className="dashboard__booking-card"
              >
                <div className="dashboard__booking-card-header">
                  <h3>{booking.spaceId.name}</h3>
                  <span
                    className={`dashboard__booking-status dashboard__booking-status--${booking.status}`}
                  >
                    {booking.status === 'confirmed' && 'Confirmé'}
                    {booking.status === 'pending' && 'En attente'}
                    {booking.status === 'cancelled' && 'Annulé'}
                  </span>
                </div>
                <div className="dashboard__booking-card-body">
                  <div className="dashboard__booking-card-info">
                    <span className="dashboard__booking-card-icon">📅</span>
                    <span>
                      {new Date(booking.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="dashboard__booking-card-info">
                    <span className="dashboard__booking-card-icon">🕐</span>
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                  <div className="dashboard__booking-card-info">
                    <span className="dashboard__booking-card-icon">💰</span>
                    <span>{booking.totalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
