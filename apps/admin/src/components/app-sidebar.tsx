"use client";

import {
  BarChart,
  Bug,
  Calculator,
  Calendar,
  Clock,
  Database,
  FileText,
  Home,
  LifeBuoy,
  MessageSquare,
  Package,
  Send,
  Terminal,
  Users,
  Warehouse,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/usePermissions";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const permissions = usePermissions();

  // Navigation dynamique selon les permissions
  const navMain = React.useMemo(() => {
    const items = [];

    // Dashboard (tous)
    if (permissions.canViewDashboard) {
      items.push({
        title: "Accueil",
        url: "/",
        icon: Home,
      });
    }

    // Analytics (dev + admin)
    if (permissions.canViewAnalytics) {
      items.push({
        title: "Analytics",
        url: "/analytics",
        icon: BarChart,
      });
    }

    // Comptabilité (dev + admin)
    if (permissions.canViewAccounting) {
      items.push({
        title: "Comptabilité",
        url: "/accounting",
        icon: Calculator,
        items: [
          {
            title: "Vue d'ensemble",
            url: "/accounting",
          },
          {
            title: "Contrôle de Caisse",
            url: "/accounting/cash-control",
          },
        ],
      });
    }

    // Utilisateurs (dev + admin)
    if (permissions.canViewUsers) {
      items.push({
        title: "Utilisateurs",
        url: "/users",
        icon: Users,
      });
    }

    // Réservations (tous)
    if (permissions.canViewBookings) {
      items.push({
        title: "Réservations",
        url: "/bookings",
        icon: Calendar,
        items: permissions.canManageBookings
          ? [
              {
                title: "Liste",
                url: "/bookings",
              },
              {
                title: "Calendrier",
                url: "/bookings/calendar",
              },
            ]
          : undefined,
      });
    }

    // Espaces (dev + admin)
    if (permissions.canViewSpaces) {
      items.push({
        title: "Espaces",
        url: "/spaces",
        icon: Warehouse,
        items: [
          {
            title: "Liste",
            url: "/spaces",
          },
          {
            title: "Gérer",
            url: "/spaces/manage",
          },
        ],
      });
    }

    // Produits (dev + admin)
    if (permissions.canViewProducts) {
      items.push({
        title: "Produits",
        url: "/products",
        icon: Package,
        items: [
          {
            title: "Liste",
            url: "/products",
          },
          {
            title: "Catégories",
            url: "/products/categories",
          },
        ],
      });
    }

    // Blog (dev + admin)
    if (permissions.canViewBlog) {
      items.push({
        title: "Blog",
        url: "/blog",
        icon: FileText,
        items: [
          {
            title: "Articles",
            url: "/blog/articles",
          },
          {
            title: "Catégories",
            url: "/blog/categories",
          },
          {
            title: "Commentaires",
            url: "/blog/comments",
          },
        ],
      });
    }

    // Planning (tous)
    if (permissions.canViewOwnSchedule) {
      items.push({
        title: "Planning",
        url: "/schedule",
        icon: Clock,
      });
    }

    // Messages (tous)
    if (permissions.canUseMessages) {
      items.push({
        title: "Messages",
        url: "/messages",
        icon: MessageSquare,
      });
    }

    // Dev Tools (dev only)
    if (permissions.canAccessDevTools) {
      items.push({
        title: "Dev Tools",
        url: "/dev",
        icon: Terminal,
        items: [
          {
            title: "Logs",
            url: "/dev/logs",
          },
          {
            title: "Debug",
            url: "/dev/debug",
          },
          {
            title: "Database",
            url: "/dev/database",
          },
        ],
      });
    }

    return items;
  }, [permissions]);

  const navSecondary = React.useMemo(
    () => [
      {
        title: "Support",
        url: "/support",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "/feedback",
        icon: Send,
      },
    ],
    []
  );

  return (
    <Sidebar variant="inset" {...props}>
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
    </Sidebar>
  );
}
