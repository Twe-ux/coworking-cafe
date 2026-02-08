import { useEffect, useState } from "react";
import type { Booking, SpaceConfig } from "@/types/booking-confirmation";

interface UseBookingConfirmationResult {
  booking: Booking | null;
  spaceConfig: SpaceConfig | null;
  loading: boolean;
  error: string | null;
}

export const useBookingConfirmation = (
  bookingId: string,
  sessionStatus: string
): UseBookingConfirmationResult => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear booking session data when reaching confirmation page
    sessionStorage.removeItem("bookingData");
    sessionStorage.removeItem("selectedServices");

    // Allow both authenticated and unauthenticated users to view confirmation
    if (sessionStatus !== "loading") {
      fetchBooking();
    }
  }, [sessionStatus, bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Impossible de charger la réservation");
        setLoading(false);
        return;
      }

      const bookingDetails = data.data;
      setBooking(bookingDetails);

      // Fetch space configuration
      if (bookingDetails.spaceType) {
        const spaceResponse = await fetch(
          `/api/space-configurations/${bookingDetails.spaceType}`
        );
        const spaceData = await spaceResponse.json();
        if (spaceData.success) {
          setSpaceConfig(spaceData.data);
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Une erreur est survenue lors du chargement de la réservation");
      setLoading(false);
    }
  };

  return { booking, spaceConfig, loading, error };
};
