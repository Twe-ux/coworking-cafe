'use client';

import { useEffect, useState } from 'react';
import { LoadingLogo } from './LoadingLogo';

/**
 * PWA-specific styles and logic to hide header/footer in standalone mode
 * Shows loading screen with logo during initial PWA load
 */
export function PWAStyles() {
  const [isPWA, setIsPWA] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Detect PWA mode
    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches;

    console.log('[PWAStyles] isPWA:', isPWAMode);

    if (isPWAMode) {
      document.body.classList.add('is-pwa');
      setIsPWA(true);
      setShowLoader(true);

      // Hide loader after a brief moment
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1500); // 1.5s d'affichage du logo

      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove('is-pwa');
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide header and footer in PWA standalone mode */
          @media (display-mode: standalone) {
            .pwa-hide {
              display: none !important;
            }
          }

          /* Fallback: hide when body has is-pwa class */
          body.is-pwa .pwa-hide {
            display: none !important;
          }

          /* PWA loader animations */
          @keyframes pulseAnimation {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(0.95);
            }
          }

          .loading-logo {
            animation: pulseAnimation 1.5s ease-in-out infinite;
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          .pwa-loader-exit {
            animation: fadeOut 0.3s ease-out forwards;
          }
        `
      }} />

      {/* PWA Loading Screen */}
      {isPWA && showLoader && (
        <div
          className={showLoader ? '' : 'pwa-loader-exit'}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#142220',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <LoadingLogo />
        </div>
      )}
    </>
  );
}
