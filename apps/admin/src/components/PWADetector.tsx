'use client';

import { useEffect } from 'react';

/**
 * Détecte si l'app est ouverte en mode PWA (standalone)
 * et intercepte toutes les requêtes fetch pour ajouter un header X-PWA-Mode
 */
export function PWADetector() {
  useEffect(() => {
    // Détecter si en mode PWA
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    // Stocker dans sessionStorage pour y accéder partout
    if (isPWA) {
      sessionStorage.setItem('isPWA', 'true');
    }

    // Intercepter toutes les requêtes fetch pour ajouter le header
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const [resource, config] = args;

      // Ajouter header X-PWA-Mode si en mode PWA
      if (isPWA) {
        const newConfig = {
          ...config,
          headers: {
            ...config?.headers,
            'X-PWA-Mode': 'true',
          },
        };
        return originalFetch(resource, newConfig);
      }

      return originalFetch(resource, config);
    };

    console.log('[PWA Detector]', isPWA ? '✅ Mode PWA détecté' : '🌐 Mode Web');
  }, []);

  return null; // Ce composant n'affiche rien
}

/**
 * Hook pour vérifier si on est en mode PWA
 */
export function useIsPWA(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://') ||
    sessionStorage.getItem('isPWA') === 'true'
  );
}
