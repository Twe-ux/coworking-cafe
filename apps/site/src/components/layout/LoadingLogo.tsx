'use client';

import { useEffect, useState } from 'react';

/**
 * Loading logo that adapts to light/dark theme
 * Uses separate logo versions: black for light mode, white for dark mode
 */
export function LoadingLogo() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Detect system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    // Listen for theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <img
      src={isDark ? '/images/logo_white.svg' : '/images/logo-black.svg'}
      alt="CoworKing Café"
      width={200}
      height={200}
      className="loading-logo"
      style={{
        objectFit: 'contain',
      }}
    />
  );
}
