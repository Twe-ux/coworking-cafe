"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { NotificationNavigator } from "@/components/NotificationNavigator";
import { PINAuthProvider } from "@/contexts/PINAuthContext";
import { PWAAuth } from "@/components/PWAAuth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PINAuthProvider>
        <QueryClientProvider client={queryClient}>
          <PWAAuth>
            {children}
          </PWAAuth>
          <Toaster position="top-right" richColors />
          <ShadcnToaster />
          <NotificationNavigator />
        </QueryClientProvider>
      </PINAuthProvider>
    </SessionProvider>
  );
}
