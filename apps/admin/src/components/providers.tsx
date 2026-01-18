"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RoleSwitcherProvider } from "@/contexts/role-switcher-context";
import { AVAILABLE_ROLES } from "@/components/role-switcher";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <RoleSwitcherProvider availableRoles={AVAILABLE_ROLES}>
          {children}
          <Toaster position="top-right" richColors />
          <ShadcnToaster />
        </RoleSwitcherProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
