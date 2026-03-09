"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getAdminMenu, getStaffMenu } from "@/config/menuSidebar";
import { useRole } from "@/hooks/useRole";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Shield } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const { isDev, isAdmin } = useRole();
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const { counts } = useSidebarCounts();

  // Pendant le chargement, afficher le menu admin par défaut (évite le flash)
  const isLoading = status === "loading";

  // Déterminer quel menu afficher selon le rôle
  const navSections = React.useMemo(() => {
    // Pendant le chargement OU si dev/admin → menu admin complet avec toutes les sections
    if (isLoading || isDev || isAdmin) {
      return getAdminMenu(
        counts.unreadMessages,
        counts.pendingAbsences,
        counts.pendingBookings,
        counts.pendingJustifications,
        counts.draftOrders,
        isDev,
        isAdmin,
      );
    }

    // Menu STAFF pour les autres (format section pour compatibilité)
    return [{ items: getStaffMenu() }];
  }, [isDev, isAdmin, counts, isLoading]);

  // Déterminer le label de rôle (afficher admin par défaut pendant chargement)
  const roleLabel = React.useMemo(() => {
    if (isLoading) return "Administrateur";
    if (isDev) return "Développeur";
    if (isAdmin) return "Administrateur";
    return "Staff";
  }, [isDev, isAdmin, isLoading]);

  // Handler pour toggle sidebar sur mobile quand on clique sur le logo
  const handleLogoClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (isMobile && state === "collapsed") {
        e.preventDefault();
        setOpenMobile(true);
      }
    },
    [isMobile, state, setOpenMobile],
  );

  return (
    <Sidebar
      variant="floating"
      className="border-green-600"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" onClick={handleLogoClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden shrink-0">
                  <Image
                    src="/images/logo-circle.webp"
                    alt="CoworKing Café"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CoworKing Café</span>
                  <span className="truncate text-xs">{roleLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {(!isMobile || openMobile) && (
        <SidebarContent>
          {/* Toutes les sections du menu (incluant Actualités et Dev Tools) */}
          {navSections.map((section, index) => (
            <React.Fragment key={index}>
              {section.label && (
                <SidebarGroupLabel className={index > 0 ? "mt-2" : ""}>
                  {section.label}
                </SidebarGroupLabel>
              )}
              <NavMain items={section.items} />
            </React.Fragment>
          ))}
        </SidebarContent>
      )}
      {(!isMobile || openMobile) && (
        <SidebarFooter>
          {/* Bouton Accès Admin - visible pour non-admin/dev */}
          {!isDev && !isAdmin && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <Link href="/login">
                    <Shield className="h-5 w-5" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        Accès Admin
                      </span>
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
