'use client';

import { LoadingLogo } from "../../components/layout/LoadingLogo";

/**
 * Loading UI shown during page transitions and initial load
 * Full-screen loader in PWA mode, centered spinner on desktop
 */
export default function Loading() {
  return (
    <>
      <style jsx>{`
        /* Desktop: centered loader with min-height */
        .loading-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .spinner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #142220;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* PWA: full-screen loader with logo */
        @media (display-mode: standalone) {
          .loading-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #142220;
            z-index: 9999;
            min-height: 100vh;
            padding: 0;
          }

          .spinner {
            display: none;
          }

          .pwa-logo {
            display: flex;
          }
        }

        .pwa-logo {
          display: none;
        }

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

        /* Mobile: full-screen loader */
        @media (max-width: 767px) {
          .loading-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #142220;
            z-index: 9999;
            min-height: 100vh;
            padding: 0;
          }

          .spinner {
            display: none;
          }

          .pwa-logo {
            display: flex;
          }
        }
      `}</style>

      <div className="loading-container">
        {/* Desktop spinner */}
        <div className="spinner" />

        {/* PWA/Mobile logo */}
        <div className="pwa-logo">
          <LoadingLogo />
        </div>
      </div>
    </>
  );
}
