"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/admin/profile");
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `${window.location.origin}/`,
      redirect: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Utiliser l'icône User par défaut
  const RoleIcon = User;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  <RoleIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              className="p-4 min-w-[17rem] rounded-lg border border-green-600 shadow-lg"
              align="end"
              side="right"
              style={{
                zIndex: 99999,
                backgroundColor: "white",
                marginLeft: isMobile ? -20 : 80,
                top: 810,
                position: "fixed",
              }}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      <RoleIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="mb-3">
                <div
                  onClick={handleProfileClick}
                  className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors border border-transparent text-green-700 hover:bg-green-50 hover:text-green-700 hover:border-green-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  role="menuitem"
                >
                  <User />
                  Mon profil
                </div>
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator /> */}
              <div
                onClick={handleLogout}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors border border-transparent text-red-700 hover:bg-red-50 hover:text-red-700 hover:border-red-500 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                role="menuitem"
              >
                <LogOut />
                Se déconnecter
              </div>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
