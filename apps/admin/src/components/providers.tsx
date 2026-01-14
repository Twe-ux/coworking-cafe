"use client"

import { SessionProvider } from "next-auth/react"
import { RoleSwitcherProvider } from "@/contexts/role-switcher-context"
import { AVAILABLE_ROLES } from "@/components/role-switcher"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RoleSwitcherProvider availableRoles={AVAILABLE_ROLES}>
        {children}
      </RoleSwitcherProvider>
    </SessionProvider>
  )
}
