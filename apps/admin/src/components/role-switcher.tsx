"use client";

import { ChevronsUpDown, Shield, User, Users } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRoleSwitcher, type Role } from "@/contexts/role-switcher-context";

export const AVAILABLE_ROLES: Role[] = [
  {
    name: "CoworKing Café",
    logo: Shield,
    label: "Développeur",
    value: "dev",
    description: "Accès complet à tous les modules",
  },
  {
    name: "CoworKing Café",
    logo: Users,
    label: "Administrateur",
    value: "admin",
    description: "Gestion administrative",
  },
  {
    name: "CoworKing Café",
    logo: User,
    label: "Staff",
    value: "staff",
    description: "Opérations quotidiennes",
  },
];

export function RoleSwitcher() {
  const { isMobile } = useSidebar();
  const { selectedRole, setSelectedRole, canSwitchRole, availableRoles } =
    useRoleSwitcher();

  const handleRoleSwitch = React.useCallback(
    (role: Role) => {
      if (!canSwitchRole) return;
      setSelectedRole(role);
    },
    [canSwitchRole, setSelectedRole]
  );

  if (!selectedRole) {
    return null;
  }

  // For non-dev users, show read-only version
  if (!canSwitchRole) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
              <Image
                src="/logo/logo-circle.webp"
                alt="CoworKing Café"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {selectedRole.name}
              </span>
              <span className="truncate text-xs">{selectedRole.label}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/logo/logo-circle.webp"
                  alt="CoworKing Café"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedRole.name}
                </span>
                <span className="truncate text-xs">{selectedRole.label}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              className="min-w-[17rem] rounded-lg border shadow-lg border-green-600"
              style={{
                zIndex: 99999,
                backgroundColor: "white",
                top: isMobile ? 0 : 10,
                marginLeft: isMobile ? -20 : 80,
                position: "fixed",
              }}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Changer de rôle (dev only)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRoles.map((role) => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => handleRoleSwitch(role)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <role.logo className="size-4 shrink-0" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </div>
                  {role.value === selectedRole.value && (
                    <div className="ml-auto size-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
