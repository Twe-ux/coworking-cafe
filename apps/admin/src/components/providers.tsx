"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RoleSwitcherProvider } from "@/contexts/role-switcher-context";
import { AVAILABLE_ROLES } from "@/components/role-switcher";
import { queryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <RoleSwitcherProvider availableRoles={AVAILABLE_ROLES}>
          {children}
        </RoleSwitcherProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
