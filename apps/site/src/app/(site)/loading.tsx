import Image from "next/image";

/**
 * Loading UI shown during page transitions
 * Full-screen loader with logo
 */
export default function Loading() {
  return (
    <div
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
        zIndex: 9999,
      }}
    >
      <Image
        src="/images/logo_white.svg"
        alt="Loading..."
        width={200}
        height={200}
        priority
        style={{
          objectFit: 'contain',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
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
