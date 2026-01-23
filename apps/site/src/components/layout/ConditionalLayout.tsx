'use client';

import { usePathname } from 'next/navigation';
import { useIsPWA } from '@/hooks/useIsPWA';
import { PWALoadingScreen } from './PWALoadingScreen';
import { ReactNode } from 'react';

interface ConditionalLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Conditional layout that hides header/footer in PWA mode for specific routes
 * Shows loading screen while detecting PWA mode to prevent header/footer flash
 * Routes where header/footer are hidden in PWA: /booking, /dashboard, /auth, /{userId}
 */
export function ConditionalLayout({ header, footer, children }: ConditionalLayoutProps) {
  const { isPWA, isLoading } = useIsPWA();
  const pathname = usePathname();

  // Routes where we hide header/footer in PWA mode
  const hideInPWA =
    pathname.startsWith('/booking') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    // Client dashboard pattern (/{userId}/...)
    /^\/[^\/]+(?:\/(?:profile|reservations|settings))?/.test(pathname);

  // Show loading screen while detecting PWA mode on routes that would hide header/footer
  if (isLoading && hideInPWA) {
    return <PWALoadingScreen />;
  }

  const shouldHideHeaderFooter = isPWA && hideInPWA;

  return (
    <>
      {!shouldHideHeaderFooter && header}
      {children}
      {!shouldHideHeaderFooter && footer}
    </>
  );
}
