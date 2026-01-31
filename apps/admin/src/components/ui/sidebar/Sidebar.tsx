"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { useSidebar } from "./context";
import type { SidebarProps } from "./types";

/**
 * Main Sidebar component
 * Handles desktop/mobile behavior, hover interactions, touch gestures
 */
export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile, setOpen } = useSidebar();
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number>(0);
  const isDraggingRef = React.useRef<boolean>(false);

  // Hover interactions - only on desktop
  const handleMouseEnter = React.useCallback(() => {
    if (isMobile || state === "expanded" || collapsible === "none") return;

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
    setOpen(true);
  }, [isMobile, state, collapsible, setOpen]);

  const handleMouseLeave = React.useCallback(() => {
    if (isMobile || state === "collapsed" || collapsible === "none") return;

    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 300);
  }, [isMobile, state, collapsible, setOpen]);

  // Enhanced touch handling for mobile
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      isDraggingRef.current = false;
    },
    [isMobile],
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !startXRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - startXRef.current;

      // Mark as dragging if moved more than 10px
      if (Math.abs(deltaX) > 10) {
        isDraggingRef.current = true;
      }

      // Handle swipe to close when sidebar is open
      if (openMobile && deltaX < -50) {
        e.preventDefault(); // Prevent scrolling
      }
    },
    [isMobile, openMobile],
  );

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !startXRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startXRef.current;

      // Handle swipe gestures
      if (isDraggingRef.current) {
        // Swipe left to close (when open)
        if (openMobile && deltaX < -100) {
          setOpenMobile(false);
        }
        // Swipe right to open (when closed and swipe starts from left edge)
        else if (!openMobile && deltaX > 100 && startXRef.current < 50) {
          setOpenMobile(true);
        }
      }

      // Reset tracking
      startXRef.current = 0;
      isDraggingRef.current = false;
    },
    [isMobile, openMobile, setOpenMobile],
  );

  // Handle escape key for mobile
  React.useEffect(() => {
    if (!isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openMobile) {
        setOpenMobile(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, openMobile, setOpenMobile]);

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (!isMobile) return;

    if (openMobile) {
      document.body.style.overflow = "hidden";
      // Add iOS-specific viewport fixes
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isMobile, openMobile]);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Use same sidebar for all screen sizes
  return (
    <>
      {/* Overlay when sidebar is expanded in mobile - click to close */}
      {isMobile && state === "expanded" && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Zone de hover étendue (desktop uniquement) - du bord gauche jusqu'à la sidebar */}
      {!isMobile &&
        state === "collapsed" &&
        collapsible === "icon" &&
        variant === "floating" && (
          <div
            className="fixed top-0 left-0 h-screen w-[calc(var(--sidebar-width-icon)+1rem)] z-30"
            onMouseEnter={handleMouseEnter}
            aria-hidden="true"
          />
        )}

      <aside
        ref={sidebarRef}
        className={cn(
          "bg-sidebar text-sidebar-foreground group/sidebar flex shrink-0 flex-col transition-all duration-300 ease-in-out z-40",
          // Width and height based on state, collapsible setting, and mobile
          state === "collapsed" && collapsible === "icon"
            ? isMobile
              ? "w-[3rem] h-[3rem] rounded-lg" // Mobile collapsed: 56px with padding around logo
              : "h-screen w-[var(--sidebar-width-icon)]" // Desktop collapsed: normal icon width
            : isMobile
              ? "h-screen w-[var(--sidebar-width)]" // Mobile expanded: full screen height
              : "h-screen w-[var(--sidebar-width)]", // Desktop: normal
          // Enhanced desktop variant styles
          variant === "floating" && [
            state === "collapsed" && isMobile
              ? "fixed top-4 left-4 z-40 rounded-lg border border-green-700 bg-background shadow-xl" // Mobile collapsed: bg blanc, border complète
              : "fixed top-4 left-4 z-40 h-[calc(100vh-2rem)] rounded-xl border shadow-xl",
            state === "collapsed" && isMobile
              ? "" // Pas de bg override pour mobile collapsed (on garde bg-background défini ci-dessus)
              : "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur",
            // Better floating shadow and border pour expanded
            state === "expanded" && "border-green-700 border shadow-2xl",
          ],
          variant === "sidebar" && "border-r",
          variant === "inset" && "border-0 shadow-md",
          className,
        )}
        data-state={state}
        data-variant={variant}
        data-collapsible={collapsible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Navigation principale"
        {...props}
      >
        {children}
      </aside>
    </>
  );
}
