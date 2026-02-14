'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LoadingLogo } from './LoadingLogo';

/**
 * PWA-specific styles and logic to hide header/footer in standalone mode
 * Shows loading screen with logo during initial PWA load
 */
export function PWAStyles() {
  const [isPWA, setIsPWA] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const pathname = usePathname();

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

  // Disable scroll on auth pages in PWA mode
  useEffect(() => {
    if (isPWA && pathname.startsWith('/auth')) {
      document.body.classList.add('pwa-no-scroll');
    } else {
      document.body.classList.remove('pwa-no-scroll');
    }

    return () => {
      document.body.classList.remove('pwa-no-scroll');
    };
  }, [isPWA, pathname]);

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

          /* Disable scroll on auth pages in PWA mode */
          body.pwa-no-scroll {
            overflow: hidden !important;
            height: 100vh !important;
            position: fixed !important;
            width: 100% !important;
          }

          /* Reduce auth page paddings in PWA to fit content without scroll */
          body.pwa-no-scroll .auth-section {
            padding-top: 0.5rem !important;
            padding-bottom: 0 !important;
            min-height: 100vh !important;
            display: flex !important;
            align-items: center !important;
          }

          body.pwa-no-scroll .auth-section .container {
            padding-bottom: 0.5rem !important;
          }

          /* Reduce font sizes in PWA auth pages */
          body.pwa-no-scroll .auth-title {
            font-size: 1.5rem !important;
            margin-bottom: 0.5rem !important;
          }

          body.pwa-no-scroll .form-label {
            font-size: 0.875rem !important;
            margin-bottom: 0.25rem !important;
          }

          body.pwa-no-scroll .auth-input,
          body.pwa-no-scroll .form-control {
            font-size: 0.875rem !important;
            padding: 0.5rem 0.75rem !important;
          }

          body.pwa-no-scroll .auth-btn {
            font-size: 0.875rem !important;
            padding: 0.5rem 1rem !important;
          }

          /* Reduce spacing between form elements in PWA */
          body.pwa-no-scroll .auth-form .mb-3,
          body.pwa-no-scroll .auth-form .mb-4 {
            margin-bottom: 0.5rem !important;
          }

          body.pwa-no-scroll .auth-header {
            margin-bottom: 0.75rem !important;
          }

          body.pwa-no-scroll .auth-footer {
            margin-top: 0.75rem !important;
          }

          body.pwa-no-scroll .auth-footer p {
            font-size: 0.875rem !important;
            margin-bottom: 0 !important;
          }

          body.pwa-no-scroll .alert {
            font-size: 0.875rem !important;
            padding: 0.5rem !important;
            margin-bottom: 0.5rem !important;
          }

          body.pwa-no-scroll .form-check-label {
            font-size: 0.875rem !important;
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
