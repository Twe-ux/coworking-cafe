"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { SidebarGroupLabelProps } from "./types";

/**
 * SidebarHeader component
 * Container for sidebar header content (logo, title, etc.)
 */
export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/**
 * SidebarFooter component
 * Container for sidebar footer content (user profile, settings, etc.)
 */
export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 border-t p-4", className)}
      {...props}
    />
  );
}

/**
 * SidebarContent component
 * Main scrollable content area of sidebar
 */
export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-2 pt-4", className)}
      {...props}
    />
  );
}

/**
 * SidebarGroup component
 * Groups related sidebar items together
 */
export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

/**
 * SidebarGroupLabel component
 * Label for a group of sidebar items
 * Hidden when sidebar is collapsed
 */
export function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "text-muted-foreground px-2 py-1 text-xs font-medium transition-opacity duration-200",
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...props}
    />
  );
}

/**
 * SidebarGroupContent component
 * Container for group content
 */
export function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("w-full text-sm", className)} {...props} />;
}
