"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { useSidebar } from "./context";
import type {
  SidebarMenuButtonProps,
  SidebarMenuSubButtonProps,
  SidebarMenuActionProps
} from "./types";

/**
 * SidebarMenu component
 * Container for menu items
 */
export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      {...props}
    />
  );
}

/**
 * SidebarMenuItem component
 * Individual menu item container
 */
export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

/**
 * SidebarMenuButton component
 * Interactive button for menu items
 * Responsive sizing and touch optimization
 */
export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  size = "default",
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";
  const { isMobile } = useSidebar();

  return (
    <Comp
      className={cn(
        // Base styles with enhanced mobile touch
        "relative flex w-full items-center gap-2 rounded-md text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        // Enhanced mobile touch interactions
        "touch-manipulation select-none",
        "active:bg-accent/80 active:scale-[0.98]",
        // Mobile-optimized sizing
        size === "default" &&
          (isMobile ? "h-10 px-3 text-sm" : "h-8 px-2 text-sm"),
        size === "sm" && (isMobile ? "h-8 px-2 text-sm" : "h-7 px-1 text-xs"),
        size === "lg" &&
          (isMobile ? "h-12 px-4 text-base" : "h-12 px-2 text-sm"),
        // Ensure minimum touch target size for mobile
        isMobile && "min-h-[44px]",
        // Active state styling
        isActive && "bg-accent text-accent-foreground font-medium",
        // Enhanced focus states for accessibility
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:outline-none",
        // Handle collapsed state: center icons, hide text
        "group-data-[state=collapsed]/sidebar:[&>span]:hidden",
        "group-data-[state=collapsed]/sidebar:[&>a>span]:hidden",
        "group-data-[state=collapsed]/sidebar:[&>a]:justify-center",
        "group-data-[state=collapsed]/sidebar:justify-center",
        "group-data-[state=collapsed]/sidebar:[&>div.grid]:hidden",
        "group-data-[state=collapsed]/sidebar:[&>div.flex.aspect-square]:mx-auto",
        "group-data-[state=collapsed]/sidebar:[&>.ml-auto]:hidden",
        "group-data-[state=collapsed]/sidebar:[&>svg]:flex",
        "group-data-[state=collapsed]/sidebar:[&>a>svg]:flex",
        // Avatar visibility in collapsed state
        "group-data-[state=collapsed]/sidebar:[&>span.relative]:mx-auto",
        "group-data-[state=collapsed]/sidebar:[&>span.relative]:flex",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        "[&>a>svg]:size-4 [&>a>svg]:shrink-0",
        // Mobile-specific adjustments for collapsed state
        isMobile && "group-data-[state=collapsed]/sidebar:px-2",
        className
      )}
      title={tooltip}
      aria-current={isActive ? "page" : undefined}
      tabIndex={0}
      {...props}
    />
  );
}

/**
 * SidebarMenuSub component
 * Container for submenu items
 */
export function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn(
        "border-coffee-primary ml-4 flex min-w-0 flex-col gap-1 border-l py-1 pl-3",
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuSubItem component
 * Individual submenu item container
 */
export function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

/**
 * SidebarMenuSubButton component
 * Interactive button for submenu items
 */
export function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      className={cn(
        "hover:bg-accent hover:text-accent-foreground flex h-7 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition-colors",
        isActive && "bg-accent text-accent-foreground font-medium",
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarMenuAction component
 * Action button for menu items (edit, delete, etc.)
 */
export function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-none transition-transform",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[state=collapsed]/sidebar:hidden",
        showOnHover && "opacity-0 group-hover:opacity-100",
        className
      )}
      {...props}
    />
  );
}
