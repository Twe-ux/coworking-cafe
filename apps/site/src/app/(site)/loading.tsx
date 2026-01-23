import { LoadingLogo } from '../../components/layout/LoadingLogo';

/**
 * Loading UI shown during page transitions and initial load
 * Uses the same design as PWA loading screen for consistency
 * Logo adapts to light/dark theme automatically
 */
export default function Loading() {
  return (
    <>
      <style>{`
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
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#F5EFE0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <LoadingLogo />
      </div>
    </>
  );
}
