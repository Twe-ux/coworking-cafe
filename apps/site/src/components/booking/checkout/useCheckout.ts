import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface SpaceConfig {
  name: string;
  spaceType: string;
}

interface UseCheckoutReturn {
  booking: Booking | null;
  spaceConfig: SpaceConfig | null;
  clientSecret: string | null;
  intentType: 'setup_intent' | 'manual_capture' | null;
  loading: boolean;
  error: string | null;
}

interface UseCheckoutProps {
  bookingId: string;
  sessionStatus: 'loading' | 'authenticated' | 'unauthenticated';
}

export function useCheckout({ bookingId, sessionStatus }: UseCheckoutProps): UseCheckoutReturn {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentType, setIntentType] = useState<'setup_intent' | 'manual_capture' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus !== 'loading') {
      fetchBookingAndCreateIntent();
    }
  }, [sessionStatus, bookingId]);

  const fetchBookingAndCreateIntent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking details
      const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
      const bookingData = await bookingResponse.json();

      if (!bookingData.success) {
        setError(bookingData.error || 'Impossible de charger la réservation');
        setLoading(false);
        return;
      }

      const bookingDetails = bookingData.data;
      setBooking(bookingDetails);

      // Fetch space configuration
      if (bookingDetails.spaceType) {
        const spaceResponse = await fetch(`/api/space-configurations/${bookingDetails.spaceType}`);
        const spaceData = await spaceResponse.json();
        if (spaceData.success) {
          setSpaceConfig(spaceData.data);
        }
      }

      // Check if payment is not required - redirect to confirmation
      if (bookingDetails.requiresPayment === false) {
        router.push(`/booking/confirmation/${bookingId}`);
        return;
      }

      // Check if already paid
      if (bookingDetails.paymentStatus === 'paid') {
        router.push(`/booking/confirmation/${bookingId}`);
        return;
      }

      // Check if cancelled
      if (bookingDetails.status === 'cancelled') {
        setError('Cette réservation a été annulée');
        setLoading(false);
        return;
      }

      // Create payment intent
      const intentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentData.success) {
        setError(intentData.error || 'Impossible de créer l\'intention de paiement');
        setLoading(false);
        return;
      }

      setClientSecret(intentData.data.clientSecret);
      setIntentType(intentData.data.type);
      setLoading(false);
    } catch (err) {
      setError('Une erreur est survenue lors de la préparation du paiement');
      setLoading(false);
    }
  };

  return {
    booking,
    spaceConfig,
    clientSecret,
    intentType,
    loading,
    error,
  };
}
