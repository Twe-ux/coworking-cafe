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
  // Initialize with synchronous detection
  const getInitialPWAState = (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isPWAMode = isStandalone || isIOSStandalone;

    // Debug logs
    console.log('[useIsPWA] Detection:', {
      isStandalone,
      isIOSStandalone,
      isPWAMode,
      displayMode: window.matchMedia('(display-mode: standalone)').media
    });

    return isPWAMode;
  };

  const initialIsPWA = getInitialPWAState();

  const [state, setState] = useState<PWAState>(() => ({
    isPWA: initialIsPWA,
    // Show loader only if we detect PWA initially
    isLoading: initialIsPWA,
  }));

  useEffect(() => {
    // Only if we detected PWA initially, hide loader after a brief moment
    if (initialIsPWA) {
      const timer = setTimeout(() => {
        setState({
          isPWA: true,
          isLoading: false,
        });
      }, 500); // Brief delay to show the loader

      return () => clearTimeout(timer);
    } else {
      // If not PWA, immediately set isLoading to false
      setState({
        isPWA: false,
        isLoading: false,
      });
    }
  }, [initialIsPWA]);

  return state;
}
