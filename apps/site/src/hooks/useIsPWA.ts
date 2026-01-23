'use client';

import { useEffect, useState } from 'react';

interface PWAState {
  isPWA: boolean;
  isLoading: boolean;
}

/**
 * Hook to detect if the app is running in PWA standalone mode
 * @returns {isPWA, isLoading} - isPWA: true if running as PWA, isLoading: true while detecting
 */
export function useIsPWA(): PWAState {
  const [state, setState] = useState<PWAState>({
    isPWA: false,
    isLoading: true, // Start with loading true to prevent flash
  });

  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    // Check for standalone mode (works on all platforms)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // iOS Safari specific check
    const isIOSStandalone = (window.navigator as any).standalone === true;

    // Update state with detection result
    setState({
      isPWA: isStandalone || isIOSStandalone,
      isLoading: false,
    });
  }, []);

  return state;
}
