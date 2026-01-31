"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SidebarContext } from "./context";
import type { SidebarProviderProps, SidebarContextProps } from "./types";

/**
 * SidebarProvider component
 * Manages sidebar state and provides context to children
 * Handles mobile/desktop detection and responsive behavior
 */
export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  // Initialize isMobile as false for SSR, will be updated on client
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Enhanced mobile detection with performance optimizations
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Close mobile sidebar when switching to desktop
      if (!mobile && openMobile) {
        setOpenMobile(false);
      }
    };

    checkMobile();

    // Debounced resize handler for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", debouncedResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedResize);
    };
  }, [openMobile, setOpenMobile]);

  // State doit être basé sur openMobile quand on est sur mobile, sinon sur open
  const state = (isMobile ? openMobile : open) ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper has-[[data-collapsible=icon]]:group-has-[[data-state=collapsed]]/sidebar-wrapper flex w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
