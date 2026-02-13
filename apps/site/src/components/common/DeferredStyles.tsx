'use client';

import { useEffect } from 'react';

/**
 * DeferredStyles - Loads page-specific CSS asynchronously after initial render
 *
 * Deferred CSS contains styles for secondary pages (booking, dashboard,
 * legal pages, contact, etc.) that are NOT needed for the homepage.
 *
 * Impact:
 * - Reduces render-blocking CSS by ~15-25 KB gzipped
 * - Page-specific styles load ~100ms after paint (imperceptible)
 */
export function DeferredStyles() {
  useEffect(() => {
    import('@/assets/site/scss/deferred.scss');
  }, []);

  return null;
}
