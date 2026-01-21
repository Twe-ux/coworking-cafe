"use client";

import * as React from "react";
import type { SidebarContextProps } from "./types";

/**
 * Sidebar context for managing sidebar state
 */
export const SidebarContext = React.createContext<SidebarContextProps | null>(null);

/**
 * Hook to access sidebar context
 * Must be used within SidebarProvider
 */
export function useSidebar(): SidebarContextProps {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}
