// ============================================================================
// useBookingDetailsPage Hook
// ============================================================================
// Page-level logic for booking/details: redirect, scroll, labels, continue
// Created: 2026-02-13
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SPACE_TYPE_INFO } from "@/types/booking";
import type { BookingData, ContactFormData, SpaceTypeInfo } from "@/types/booking";
import { getPeopleDisplayLabel } from "@/lib/utils/booking-display";

// ============================================================================
// Types
// ============================================================================

interface UseBookingDetailsPageParams {
  bookingData: BookingData | null;
  contactForm: ContactFormData;
  validateContactForm: () => boolean;
  loading: boolean;
}

interface BookingLabels {
  dateLabel: string;
  timeLabel: string;
  peopleLabel: string;
  spaceInfo: SpaceTypeInfo;
}

interface UseBookingDetailsPageReturn {
  isPageLoading: boolean;
  bookingCardRef: React.RefObject<HTMLDivElement | null>;
  isLoggedIn: boolean;
  labels: BookingLabels | null;
  handleContinue: () => Promise<void>;
}

// ============================================================================
// Helpers
// ============================================================================

function buildLabels(bookingData: BookingData): BookingLabels {
  const spaceInfo = SPACE_TYPE_INFO[bookingData.spaceType] || {
    title: "Espace",
    subtitle: "",
  };

  const dateLabel = new Date(bookingData.date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  const timeLabel = `${bookingData.startTime}-${bookingData.endTime}`;
  const peopleLabel = getPeopleDisplayLabel(bookingData.numberOfPeople, bookingData.spaceType);

  return { dateLabel, timeLabel, peopleLabel, spaceInfo };
}

async function saveUserProfile(contactForm: ContactFormData): Promise<void> {
  await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: contactForm.contactName,
      email: contactForm.contactEmail,
      phone: contactForm.contactPhone,
      companyName: contactForm.contactCompanyName,
    }),
  });
}

function storeAutoLoginCredentials(contactForm: ContactFormData): void {
  if (!contactForm.createAccount || !contactForm.password) return;

  try {
    sessionStorage.setItem(
      "autoLogin",
      JSON.stringify({
        email: contactForm.contactEmail,
        password: contactForm.password,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("[Auto-login] Failed to store credentials:", error);
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useBookingDetailsPage({
  bookingData,
  contactForm,
  validateContactForm,
  loading,
}: UseBookingDetailsPageParams): UseBookingDetailsPageReturn {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const bookingCardRef = useRef<HTMLDivElement | null>(null);

  // Redirect if no booking data
  useEffect(() => {
    if (bookingData) {
      setIsPageLoading(false);
      return;
    }

    const hasStoredData =
      typeof window !== "undefined" && sessionStorage.getItem("bookingData");

    const timer = setTimeout(() => {
      if (!bookingData && !hasStoredData) {
        router.push("/booking");
      } else {
        setIsPageLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [bookingData, router]);

  // Auto-scroll to booking card
  useEffect(() => {
    if (!bookingData || !bookingCardRef.current) return;

    const scrollTimer = setTimeout(() => {
      const element = bookingCardRef.current;
      if (!element) return;

      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, [bookingData]);

  // Handle continue button
  const handleContinue = useCallback(async (): Promise<void> => {
    if (!validateContactForm()) return;

    // Save profile if logged in with new phone/company
    if (
      session?.user &&
      (contactForm.contactPhone || contactForm.contactCompanyName)
    ) {
      try {
        await saveUserProfile(contactForm);
      } catch {
        // Continue anyway - profile update is optional
      }
    }

    // Store credentials for auto-login after booking
    storeAutoLoginCredentials(contactForm);

    router.push("/booking/summary");
  }, [validateContactForm, session, contactForm, router]);

  // Build labels only when bookingData is available
  const labels = bookingData ? buildLabels(bookingData) : null;

  return {
    isPageLoading,
    bookingCardRef,
    isLoggedIn: !!session,
    labels,
    handleContinue,
  };
}
