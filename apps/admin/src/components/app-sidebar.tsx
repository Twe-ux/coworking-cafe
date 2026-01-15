"use client";

import { useSession } from "next-auth/react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { RoleSwitcher } from "@/components/role-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  getNavigationItems,
  getSecondaryNavigationItems,
} from "@/config/navigation-items";
import { usePermissions } from "@/hooks/usePermissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const permissions = usePermissions();

  // Navigation dynamique selon les permissions
  const navMain = React.useMemo(
    () => getNavigationItems(permissions),
    [permissions]
  );

  const navSecondary = React.useMemo(() => getSecondaryNavigationItems(), []);

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <RoleSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {session?.user && (
          <NavUser
            user={{
              name: session.user.name || "Utilisateur",
              email: session.user.email || "",
              role: session.user.role,
            }}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
