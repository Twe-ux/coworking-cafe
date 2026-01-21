"use client";

import * as React from "react";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./context";

/**
 * SidebarTrigger component
 * Button to toggle sidebar open/closed
 * Responsive sizing for mobile/desktop
 */
export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        // Enhanced mobile touch targets
        isMobile ? "h-10 w-10" : "h-7 w-7",
        // Better mobile touch feedback
        "touch-manipulation select-none",
        // Ensure minimum touch target size (44px on iOS)
        "min-h-[44px] min-w-[44px] md:min-h-[28px] md:min-w-[28px]",
        // Enhanced focus states for accessibility
        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none",
        className
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
        toggleSidebar();
      }}
      aria-label={
        isMobile ? "Ouvrir la navigation" : "Basculer la barre latérale"
      }
      {...props}
    >
      <PanelLeftIcon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
      <span className="sr-only">
        {isMobile ? "Ouvrir la navigation" : "Basculer la barre latérale"}
      </span>
    </button>
  );
}
