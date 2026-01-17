"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    badge?: number;
    items?: {
      title: string;
      url: string;
      badge?: number;
    }[];
  }[];
}) {
  const { state, setOpen } = useSidebar();
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  // Close all collapsibles when sidebar is collapsed
  React.useEffect(() => {
    if (state === "collapsed") {
      setOpenItems({});
    }
  }, [state]);

  const handleOpenChange = (itemTitle: string, isOpen: boolean) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemTitle]: isOpen,
    }));
  };

  const handleLinkClick = () => {
    // Close sidebar when clicking on a link
    setOpen(false);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openItems[item.title] ?? item.isActive}
            onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
          >
            <SidebarMenuItem className="relative">
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} onClick={handleLinkClick}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>

              {/* Point rouge sur l'icône quand sidebar fermée */}
              {item.badge && item.badge > 0 && state === "collapsed" && (
                <span className="absolute top-2 left-6 h-2 w-2 rounded-full bg-red-500 border border-background z-10" />
              )}

              {/* Pastille rouge quand sidebar ouverte ET menu fermé - positionnée AVANT le chevron */}
              {item.badge && item.badge > 0 && state === "expanded" && !openItems[item.title] && (
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500"
                  style={{ right: item.items?.length ? '2.5rem' : '0.5rem' }}
                />
              )}

              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url} onClick={handleLinkClick} className="flex items-center">
                              <span>{subItem.title}</span>
                              {/* Badge sur le sous-item quand menu ouvert - juste après le texte */}
                              {subItem.badge && subItem.badge > 0 && (
                                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
