'use client';

import { SessionProvider } from 'next-auth/react';
import { ReduxProvider } from './ReduxProvider';

export function SiteProvidersWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
      </ReduxProvider>
    </SessionProvider>
  );
}
