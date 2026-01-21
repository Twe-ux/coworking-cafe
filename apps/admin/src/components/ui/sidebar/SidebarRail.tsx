"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./context";

/**
 * SidebarRail component
 * Invisible rail on the edge of sidebar for toggle interaction
 */
export function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      aria-label="Toggle Sidebar"
      onClick={toggleSidebar}
      className={cn(
        "hover:bg-accent absolute inset-y-0 right-0 w-2",
        className
      )}
      {...props}
    />
  );
}
