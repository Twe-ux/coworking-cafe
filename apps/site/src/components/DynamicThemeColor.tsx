'use client';

import { useEffect } from 'react';

/**
 * Set theme color for PWA status bar
 * Uses the same color as body background (--body-clr)
 */
export function DynamicThemeColor() {
  useEffect(() => {
    // Update meta theme-color tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    // Set dark greenish color matching body background (--body-clr: #142220)
    metaThemeColor.setAttribute('content', '#142220');
  }, []);

  return null; // This component doesn't render anything
}
