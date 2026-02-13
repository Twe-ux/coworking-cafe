// ============================================================================
// useBookingAccordion Hook
// ============================================================================
// Hook personnalisé pour gérer les accordions et l'auto-scroll
// ============================================================================

import { useState, useRef, useCallback } from "react";

/**
 * Return type du hook useBookingAccordion
 */
interface UseBookingAccordionReturn {
  // Date section
  dateSectionOpen: boolean;
  dateSectionClosing: boolean;
  toggleDateSection: () => void;
  openDateSection: () => void;
  closeDateSection: () => void;

  // Time section
  timeSectionOpen: boolean;
  toggleTimeSection: () => void;
  openTimeSection: () => void;
  closeTimeSection: () => void;

  // Refs for auto-scroll
  timeSectionRef: React.RefObject<HTMLDivElement | null>;
  priceSectionRef: React.RefObject<HTMLDivElement | null>;
  bookingCardRef: React.RefObject<HTMLDivElement | null>;

  // Scroll actions
  scrollToTimeSection: () => void;
  scrollToPriceSection: () => void;
  scrollToCardTop: () => void;
}

/**
 * Hook personnalisé pour gérer les accordions de réservation
 * et les scrolls automatiques
 *
 * @returns État des accordions, refs et fonctions de contrôle
 *
 * @example
 * ```tsx
 * const accordion = useBookingAccordion();
 *
 * // Usage
 * <div ref={accordion.timeSectionRef}>
 *   {accordion.timeSectionOpen && <TimeSelection />}
 * </div>
 *
 * // Open time section and scroll
 * accordion.openTimeSection();
 * accordion.scrollToTimeSection();
 * ```
 */
export function useBookingAccordion(): UseBookingAccordionReturn {
  // Date section state
  const [dateSectionOpen, setDateSectionOpen] = useState(true); // Open by default
  const [dateSectionClosing, setDateSectionClosing] = useState(false);

  // Time section state
  const [timeSectionOpen, setTimeSectionOpen] = useState(false);

  // Refs for auto-scroll
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const priceSectionRef = useRef<HTMLDivElement>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  /**
   * Toggle date section with animation
   */
  const toggleDateSection = useCallback(() => {
    if (dateSectionOpen) {
      setDateSectionClosing(true);
      setTimeout(() => {
        setDateSectionOpen(false);
        setDateSectionClosing(false);
      }, 300); // Match CSS transition duration
    } else {
      setDateSectionOpen(true);
    }
  }, [dateSectionOpen]);

  /**
   * Open date section
   */
  const openDateSection = useCallback(() => {
    if (!dateSectionOpen) {
      setDateSectionOpen(true);
      setDateSectionClosing(false);
    }
  }, [dateSectionOpen]);

  /**
   * Close date section with animation
   */
  const closeDateSection = useCallback(() => {
    if (dateSectionOpen) {
      setDateSectionClosing(true);
      setTimeout(() => {
        setDateSectionOpen(false);
        setDateSectionClosing(false);
      }, 300);
    }
  }, [dateSectionOpen]);

  /**
   * Toggle time section
   */
  const toggleTimeSection = useCallback(() => {
    setTimeSectionOpen((prev) => !prev);
  }, []);

  /**
   * Open time section
   */
  const openTimeSection = useCallback(() => {
    setTimeSectionOpen(true);
  }, []);

  /**
   * Close time section
   */
  const closeTimeSection = useCallback(() => {
    setTimeSectionOpen(false);
  }, []);

  /**
   * Scroll to time section smoothly
   */
  const scrollToTimeSection = useCallback(() => {
    if (timeSectionRef.current) {
      setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100); // Small delay to ensure section is opened
    }
  }, []);

  /**
   * Scroll to price section smoothly
   */
  const scrollToPriceSection = useCallback(() => {
    if (priceSectionRef.current) {
      setTimeout(() => {
        priceSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, []);

  /**
   * Scroll to booking card top
   */
  const scrollToCardTop = useCallback(() => {
    if (bookingCardRef.current) {
      setTimeout(() => {
        bookingCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, []);

  return {
    // Date section
    dateSectionOpen,
    dateSectionClosing,
    toggleDateSection,
    openDateSection,
    closeDateSection,

    // Time section
    timeSectionOpen,
    toggleTimeSection,
    openTimeSection,
    closeTimeSection,

    // Refs
    timeSectionRef,
    priceSectionRef,
    bookingCardRef,

    // Scroll actions
    scrollToTimeSection,
    scrollToPriceSection,
    scrollToCardTop,
  };
}
