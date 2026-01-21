/**
 * Booking Detail Page
 * Page de détail d'une réservation avec metadata dynamique
 */

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Booking, Space } from '@coworking-cafe/database';
import { BookingDetailCard } from '@/components/dashboard/BookingDetailCard';
import type { ReservationDetails } from '@/types';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const booking = await Booking.findById(params.id).populate('spaceId', 'name').lean();

    if (!booking) {
      return {
        title: 'Réservation non trouvée | Dashboard',
      };
    }

    const spaceName = booking.spaceId?.name || 'Espace';
    const date = new Date(booking.date).toLocaleDateString('fr-FR');

    return {
      title: `${spaceName} - ${date} | Mes Réservations`,
      description: `Détails de votre réservation pour ${spaceName} le ${date}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    return {
      title: 'Réservation | Dashboard',
    };
  }
}

async function getBookingDetails(
  bookingId: string,
  userId: string
): Promise<{ booking: ReservationDetails; spaceImage: string } | null> {
  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: userId,
    })
      .populate('spaceId', 'name images')
      .lean();

    if (!booking) {
      return null;
    }

    const reservationDetails: ReservationDetails = {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      spaceId: booking.spaceId._id.toString(),
      spaceName: booking.spaceId.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      numberOfPeople: booking.numberOfPeople,
      totalPrice: booking.totalPrice,
      status: booking.status,
      paymentIntentId: booking.paymentIntentId,
      specialRequests: booking.specialRequests,
      promoCode: booking.promoCode,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };

    const spaceImage = booking.spaceId.images?.[0] || '/images/placeholder-space.jpg';

    return { booking: reservationDetails, spaceImage };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return null;
  }
}

export default async function BookingDetailPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect('/auth/login?callbackUrl=/dashboard/bookings');
  }

  if (session.user.role !== 'client') {
    redirect('/dashboard');
  }

  const data = await getBookingDetails(params.id, session.user.id);

  if (!data) {
    notFound();
  }

  const { booking, spaceImage } = data;
  const isUpcoming = booking.status === 'confirmed' && new Date(booking.date) >= new Date();

  return (
    <main className="page-booking-detail">
      <div className="page-booking-detail__header">
        <a href="/dashboard/bookings" className="page-booking-detail__back">
          ← Retour aux réservations
        </a>
      </div>

      <BookingDetailCard booking={booking} spaceImage={spaceImage} />

      <div className="page-booking-detail__actions">
        {isUpcoming && (
          <form action={`/api/booking/${booking.id}/cancel`} method="POST">
            <button type="submit" className="btn btn--danger">
              Annuler cette réservation
            </button>
          </form>
        )}

        <a href={`/dashboard/bookings/${booking.id}/receipt`} className="btn btn--outline">
          Télécharger le reçu (PDF)
        </a>
      </div>

      <div className="page-booking-detail__help">
        <h3>Besoin d'aide ?</h3>
        <p>
          Si vous avez des questions concernant votre réservation, n'hésitez pas à nous contacter.
        </p>
        <a href="/dashboard/messages" className="btn btn--primary">
          Contacter le support
        </a>
      </div>
    </main>
  );
}
