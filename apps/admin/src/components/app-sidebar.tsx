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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  getNavigationItems,
  getSecondaryNavigationItems,
} from "@/config/navigation-items";
import { usePermissions } from "@/hooks/usePermissions";
import { useUnreadContactMessages } from "@/hooks/useUnreadContactMessages";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const permissions = usePermissions();
  const { state, isMobile } = useSidebar();
  const { unreadCount } = useUnreadContactMessages();

  // Navigation dynamique selon les permissions
  const navMain = React.useMemo(() => {
    const items = getNavigationItems(permissions);

    // Injecter le badge sur l'item Messages et ses sous-items
    return items.map((item) => {
      if (item.url === "/support" && unreadCount > 0) {
        // Badge sur l'item parent (pour sidebar collapsed ou menu fermé)
        const updatedItem = { ...item, badge: unreadCount };

        // Si l'item a des sous-items, injecter le badge sur le bon sous-item
        if (item.items && item.items.length > 0) {
          updatedItem.items = item.items.map((subItem) => {
            // Badge sur le sous-item "Contact"
            if (subItem.url === "/support/contact") {
              return { ...subItem, badge: unreadCount };
            }
            return subItem;
          });
        }

        return updatedItem;
      }
      return item;
    });
  }, [permissions, unreadCount]);

  const navSecondary = React.useMemo(() => getSecondaryNavigationItems(), []);

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <RoleSwitcher />
      </SidebarHeader>
      {(isMobile ? state === "expanded" : true) && (
        <SidebarContent>
          <NavMain items={navMain} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
      )}
      {(isMobile ? state === "expanded" : true) && (
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
      )}
      {!isMobile && <SidebarRail />}
    </Sidebar>
  );
}
