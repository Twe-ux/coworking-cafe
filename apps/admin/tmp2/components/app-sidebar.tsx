"use client";

import { useAuth } from "@/contexts/AuthContext";
import { HandCoins, Home, Settings2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import logo from "../../public/logo.svg";
// import logo from "../../public/icon.ico";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  // Navigation principale adaptée selon le rôle
  const getNavMain = () => {
    const baseItems = [
      {
        title: "Personnel",
        url: "/",
        icon: Users,
        isActive: false,
        items: [
          {
            title: "Pointage du personnel",
            url: "/score",
          },
        ],
      },
    ];

    // Éléments disponibles uniquement pour les admins
    const adminItems = [
      {
        title: "Finances",
        url: "/",
        icon: HandCoins,
        isActive: false,
        items: [
          {
            title: "Controle de caisse",
            url: "/accounting/cash-control",
          },
        ],
      },
      {
        title: "Administration",
        url: "/admin",
        icon: Settings2,
        isActive: false,
        items: [
          {
            title: "Liste du personnel",
            url: "/list",
          },
          {
            title: "Paramètres",
            url: "/admin/settings",
          },
        ],
      },
    ];

    // Si admin, retourner tous les éléments, sinon seulement les éléments de base
    return user?.role === "admin" ? [...adminItems, ...baseItems] : baseItems;
  };

  const data = {
    user: {
      name: user?.firstName + " " + user?.lastName || "Utilisateur",
      email: "dev@coworkingcafe.fr",
      avatar: "/avatar.png",
    },
    navMain: getNavMain(),
    navSecondary: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground overflow-hidden rounded-md py-2">
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex h-6 items-center gap-4 text-black">
                    <Image
                      src={logo}
                      width={32}
                      height={32}
                      alt="Picture of the brand"
                      className="invert filter"
                    />
                    <span>Cow or King Café</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
