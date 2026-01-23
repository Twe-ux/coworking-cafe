'use client';

import Image from 'next/image';

/**
 * Loading screen displayed while detecting PWA mode
 * Shows the logo to prevent header/footer flash
 */
export function PWALoadingScreen() {
  return (
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
      <Image
        src="/apple-touch-icon.png"
        alt="CoworKing Café"
        width={180}
        height={180}
        priority
        style={{
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
