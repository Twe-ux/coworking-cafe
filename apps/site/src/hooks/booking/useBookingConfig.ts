import { useEffect, useState } from "react";
import type { BookingData } from "@/types/booking";

/**
 * useBookingConfig - Fetch space configurations and policies
 *
 * Handles:
 * - Space configuration (deposit policies)
 * - Cancellation policy
 * - Days until booking calculation
 */

interface SpaceConfig {
  depositPolicy: {
    enabled: boolean;
    percentage?: number;
    fixedAmount?: number;
    minimumAmount?: number;
  };
}

interface CancellationTier {
  daysBeforeBooking: number;
  chargePercentage: number;
}

interface CancellationPolicy {
  spaceType: string;
  tiers: CancellationTier[];
}

const slugToSpaceType: Record<string, string> = {
  "open-space": "open-space",
  "meeting-room-glass": "salle-verriere",
  "meeting-room-floor": "salle-etage",
  "event-space": "evenementiel",
};

interface UseBookingConfigProps {
  bookingData: BookingData | null;
}

export function useBookingConfig({ bookingData }: UseBookingConfigProps) {
  const [daysUntilBooking, setDaysUntilBooking] = useState<number>(0);
  const [spaceConfig, setSpaceConfig] = useState<SpaceConfig | null>(null);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy | null>(null);

  useEffect(() => {
    if (!bookingData) return;

    // Calculate days until booking
    const now = new Date();
    const bookingDate = new Date(bookingData.date);
    const days = Math.ceil(
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    setDaysUntilBooking(days);

    // Fetch space config
    const dbSpaceType = slugToSpaceType[bookingData.spaceType] || bookingData.spaceType;

    fetch(`/api/space-configurations/${dbSpaceType}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setSpaceConfig(data.data))
      .catch((error) => console.error("Error fetching space config:", error));

    // Fetch cancellation policy
    fetch(`/api/cancellation-policy?spaceType=${dbSpaceType}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setCancellationPolicy(data.data.cancellationPolicy))
      .catch((error) => console.error("Error fetching cancellation policy:", error));
  }, [bookingData]);

  return {
    daysUntilBooking,
    spaceConfig,
    cancellationPolicy,
  };
}
