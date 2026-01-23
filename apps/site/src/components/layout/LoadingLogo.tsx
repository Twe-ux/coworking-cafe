'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Loading logo that adapts to light/dark theme
 * Uses high-quality 512x512 logo
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
    <Image
      src="/web-app-manifest-512x512.png"
      alt="CoworKing Café"
      width={200}
      height={200}
      priority
      className="loading-logo"
      style={{
        filter: isDark ? 'invert(100%)' : 'none',
      }}
    />
  );
}
