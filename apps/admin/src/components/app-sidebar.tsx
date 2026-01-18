"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { NavigationItem } from "@/config/navigation-items";
import { getSecondaryNavigationItems } from "@/config/navigation-items";
import { useRole } from "@/hooks/useRole";
import { useUnreadContactMessages } from "@/hooks/useUnreadContactMessages";
import {
  Calendar,
  Calculator,
  Clock,
  DollarSign,
  Home,
  Mail,
  ScanQrCode,
  UserCog,
  Users,
  UtensilsCrossed,
  Shield,
} from "lucide-react";

/**
 * Menu STAFF - Pour les employés (role: staff ou non connecté)
 */
function getStaffNavItems(): NavigationItem[] {
  return [
    {
      title: "Accueil",
      url: "/",
      icon: Home,
    },
    {
      title: "Pointage",
      url: "/clocking",
      icon: Clock,
    },
    {
      title: "Mon Planning",
      url: "/my-schedule",
      icon: Calendar,
    },
    {
      title: "Menu",
      url: "/menu",
      icon: UtensilsCrossed,
      items: [
        {
          title: "Recettes Boissons",
          url: "/menu/recipes?category=drinks",
        },
        {
          title: "Recettes Food",
          url: "/menu/recipes?category=food",
        },
      ],
    },
  ];
}

/**
 * Menu ADMIN - Pour les administrateurs (role: dev ou admin)
 */
function getAdminNavItems(unreadCount: number): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
    },
    {
      title: "Ressources Humaines",
      url: "/admin/hr",
      icon: UserCog,
      items: [
        {
          title: "Employés",
          url: "/admin/hr/employees",
        },
        {
          title: "Planning",
          url: "/admin/hr/schedule",
        },
        {
          title: "Pointage Admin",
          url: "/admin/hr/clocking-admin",
        },
        {
          title: "Disponibilités",
          url: "/admin/hr/availability",
        },
      ],
    },
    {
      title: "Comptabilité",
      url: "/admin/accounting",
      icon: Calculator,
      items: [
        {
          title: "Caisse",
          url: "/admin/accounting/cash-control",
        },
        {
          title: "Chiffre d'affaires",
          url: "/admin/accounting/turnover",
        },
      ],
    },
    {
      title: "Promo",
      url: "/admin/promo",
      icon: ScanQrCode,
    },
    {
      title: "Utilisateurs",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
      items: [
        {
          title: "Contact",
          url: "/admin/support/contact",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: "Menu",
      url: "/admin/menu",
      icon: UtensilsCrossed,
      items: [
        {
          title: "Boissons",
          url: "/admin/menu/drinks",
        },
        {
          title: "Food",
          url: "/admin/menu/food",
        },
      ],
    },
  ];

  return items;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { isDev, isAdmin } = useRole();
  const { state, isMobile } = useSidebar();
  const { unreadCount } = useUnreadContactMessages();

  // Déterminer quel menu afficher selon le rôle
  const navMain = React.useMemo(() => {
    // Menu ADMIN pour dev/admin
    if (isDev || isAdmin) {
      return getAdminNavItems(unreadCount);
    }

    // Menu STAFF pour les autres (staff ou non connecté)
    return getStaffNavItems();
  }, [isDev, isAdmin, unreadCount]);

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
          {/* Bouton Accès Admin - visible pour non-admin/dev */}
          {!isDev && !isAdmin && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/login">
                    <Shield className="h-5 w-5" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Accès Admin</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Se connecter
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}

          {/* NavUser - visible uniquement si connecté */}
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
