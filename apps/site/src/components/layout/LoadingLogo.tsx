'use client';

import { useEffect, useState } from 'react';

/**
 * Loading logo that adapts to light/dark theme
 * Uses favicon.svg which has built-in theme detection
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
      src="/favicon.svg"
      alt="CoworKing Café"
      width={180}
      height={180}
      className="loading-logo"
      style={{
        filter: isDark ? 'invert(100%)' : 'none',
      }}
    />
  );
}
