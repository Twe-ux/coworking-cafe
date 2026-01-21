"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./context";

/**
 * SidebarInset component
 * Main content area that adjusts based on sidebar state
 */
export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  const { isMobile, state } = useSidebar();

  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        "group-has-[[data-variant=floating]]/sidebar-wrapper:ml-0",
        "group-has-[[data-variant=inset]]/sidebar-wrapper:ml-0",
        // Add left margin in mobile when sidebar is collapsed (logo width + spacing)
        isMobile && state === "collapsed" && "ml-20",
        className
      )}
      {...props}
    />
  );
}
