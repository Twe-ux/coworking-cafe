import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { options } from "@/lib/auth-options";
import Link from "next/link";
import "./client-dashboard.scss";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@coworking-cafe/database";
import UpcomingReservationCard from "@/components/site/dashboard/UpcomingReservationCard";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

interface ClientDashboardProps {
  params: { id: string };
}

export default async function ClientDashboard({
  params,
}: ClientDashboardProps) {
  const session = await getServerSession(options);

  // Check if user is authenticated
  if (!session) {
    redirect(`/auth/login?callbackUrl=/${params.id}`);
  }

  // Support both username and ID in URL
  const userIdentifier = session.user.username || session.user.id;

  // Security check: verify the URL matches the logged-in user (username or ID)
  if (params.id !== session.user.username && params.id !== session.user.id) {
    // Redirect to their own dashboard
    redirect(`/${userIdentifier}`);
  }

  const username = session.user.username || session.user.email?.split('@')[0] || 'user';

  // Fetch user's reservation statistics
  await connectDB();
  const userId = session.user.id;

  // Use ID for all dashboard links (username may be undefined)
  const userPath = session.user.id;

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [
    activeReservations,
    completedReservations,
    allReservations,
    upcomingReservations,
  ] = await Promise.all([
    Booking.countDocuments({
      user: userId,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: todayStart },
    }),
    Booking.countDocuments({
      user: userId,
      status: "completed",
    }),
    Booking.find({
      user: userId,
      status: { $nin: ["cancelled"] },
    })
      .select("startTime endTime")
      .lean(),
    Booking.find({
      user: userId,
      status: { $in: ["pending", "confirmed"] },
      date: { $gte: todayStart },
    })
      .select(
        "spaceType date startTime endTime numberOfPeople totalPrice status paymentStatus"
      )
      .sort({ date: 1, startTime: 1 })
      .lean(),
  ]);

  // Filter out reservations that have already started today
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  interface ReservationData {
    _id: unknown;
    date: Date;
    startTime: string;
    spaceType: string;
    endTime: string;
    numberOfPeople: number;
    totalPrice: number;
    status: string;
    paymentStatus: string;
  }

  const filteredUpcomingReservations = upcomingReservations.filter((reservation) => {
    const reservationDate = new Date(reservation.date);
    reservationDate.setHours(0, 0, 0, 0);
    const isToday = reservationDate.getTime() === todayStart.getTime();

    if (!isToday) {
      // If not today, include all future dates
      return true;
    }

    // If today, check if the start time hasn't passed yet
    const [startHour, startMinute] = (reservation.startTime || "0:0").split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    return startTimeInMinutes > currentTimeInMinutes;
  }).slice(0, 3); // Limit to 3 after filtering

  // Calculate total hours booked
  const totalHours = allReservations.reduce((total, reservation) => {
    const [startHour, startMinute] = (reservation.startTime || "0:0")
      .split(":")
      .map(Number);
    const [endHour, endMinute] = (reservation.endTime || "0:0")
      .split(":")
      .map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    return total + durationMinutes / 60;
  }, 0);

  return (
    <section className="client-dashboard py__110">
      <div className="container pb__130">
        {/* Welcome Section */}
        <div className="welcome-card mb-5">
          <h1 className="welcome-title">Bonjour, {session.user.name} ! 👋</h1>
          <p className="welcome-text">Bienvenue dans votre espace personnel</p>
        </div>

        {/* Quick Actions */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="section-title">Actions rapides</h2>
          </div>

          <div className="col-md-4 mb-4">
            <Link href={`/${userPath}/reservations`} className="action-card">
              <div className="action-icon">
                <i className="bi bi-calendar-check"></i>
              </div>
              <h3 className="action-title">Mes réservations</h3>
              <p className="action-description">
                Voir et gérer vos réservations
              </p>
            </Link>
          </div>

          <div className="col-md-4 mb-4">
            <Link href="/booking" className="action-card">
              <div className="action-icon">
                <i className="bi bi-plus-circle"></i>
              </div>
              <h3 className="action-title">Nouvelle réservation</h3>
              <p className="action-description">
                Réserver un espace de coworking
              </p>
            </Link>
          </div>

          <div className="col-md-4 mb-4">
            <Link href={`/${userPath}/profile`} className="action-card">
              <div className="action-icon">
                <i className="bi bi-person"></i>
              </div>
              <h3 className="action-title">Mon profil</h3>
              <p className="action-description">
                Gérer vos informations personnelles
              </p>
            </Link>
          </div>
        </div>

        {/* Upcoming Reservations */}
        {filteredUpcomingReservations.length > 0 && (
          <div className="row mb-5">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="section-title">Prochaines réservations</h2>
                <Link
                  href={`/${userPath}/reservations`}
                  className="view-all-btn"
                >
                  Voir toutes
                </Link>
              </div>
            </div>

            {filteredUpcomingReservations.map((reservation) => (
              <UpcomingReservationCard
                key={String(reservation._id)}
                reservation={{
                  _id: String(reservation._id),
                  spaceType: reservation.spaceType,
                  date: new Date(reservation.date).toISOString().split('T')[0],
                  startTime: reservation.startTime || "00:00",
                  endTime: reservation.endTime || "00:00",
                  numberOfPeople: reservation.numberOfPeople,
                  totalPrice: reservation.totalPrice,
                  status: reservation.status,
                  paymentStatus: reservation.paymentStatus,
                }}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="row">
          <div className="col-12">
            <h2 className="section-title">Statistiques</h2>
          </div>

          <div className="col-md-4 mb-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-calendar-event"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{activeReservations}</h4>
                <p className="stat-label">Réservations actives</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-clock-history"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{Math.round(totalHours)}</h4>
                <p className="stat-label">Heures réservées</p>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{completedReservations}</h4>
                <p className="stat-label">Réservations complétées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
