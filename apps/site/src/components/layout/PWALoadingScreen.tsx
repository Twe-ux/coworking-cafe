'use client';

/**
 * Loading screen displayed while detecting PWA mode
 * Shows a video animation to prevent header/footer flash
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
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          maxWidth: '80%',
          maxHeight: '80%',
          objectFit: 'contain',
        }}
      >
        <source src="/loading.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
