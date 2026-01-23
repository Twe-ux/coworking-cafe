'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the app is running in PWA standalone mode
 * @returns true if running as PWA (standalone), false otherwise
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Check for standalone mode (works on all platforms)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // iOS Safari specific check
    const isIOSStandalone = (window.navigator as any).standalone === true;

    setIsPWA(isStandalone || isIOSStandalone);
  }, []);

  return isPWA;
}
