"use client";

import { Slot } from "@radix-ui/react-slot";
import { PanelLeftIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
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

  const state = open ? "expanded" : "collapsed";

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

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile, setOpen } = useSidebar();
  const closeTimerRef = React.useRef<NodeJS.Timeout>();
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number>(0);
  const isDraggingRef = React.useRef<boolean>(false);

  // Mobile-friendly interactions - only use hover on desktop
  const handleMouseEnter = React.useCallback(() => {
    if (!isMobile && collapsible === "icon" && state === "collapsed") {
      // Cancel any pending close
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      setOpen(true);
    }
  }, [isMobile, collapsible, state, setOpen]);

  const handleMouseLeave = React.useCallback(() => {
    if (!isMobile && collapsible === "icon") {
      // Add small delay before closing
      closeTimerRef.current = setTimeout(() => {
        setOpen(false);
      }, 300); // 300ms delay
    }
  }, [isMobile, collapsible, setOpen]);

  // Enhanced touch handling for mobile
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      const touch = e.touches[0];
      startXRef.current = touch.clientX;
      isDraggingRef.current = false;
    },
    [isMobile]
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
    [isMobile, openMobile]
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
    [isMobile, openMobile, setOpenMobile]
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
      {/* Overlay when sidebar is expanded - click to close */}
      {state === "expanded" && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
      ref={sidebarRef}
      className={cn(
        "bg-sidebar text-sidebar-foreground group/sidebar flex h-full shrink-0 flex-col transition-all duration-300 ease-in-out z-40",
        // Width based on state and collapsible setting
        state === "collapsed" && collapsible === "icon"
          ? "h-screen w-[var(--sidebar-width-icon)]"
          : "h-screen w-[var(--sidebar-width)]",
        // Enhanced desktop variant styles
        variant === "floating" && [
          "fixed top-4 left-4 z-40 h-[calc(100vh-2rem)] rounded-xl border  shadow-xl",
          "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur ",
          // Better floating shadow and border
          "border-green-700 border shadow-2xl",
        ],
        variant === "sidebar" && "border-r",
        variant === "inset" && "border-0 shadow-md",
        className
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

function SidebarTrigger({
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

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
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

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        "group-has-[[data-variant=floating]]/sidebar-wrapper:ml-0",
        "group-has-[[data-variant=inset]]/sidebar-wrapper:ml-0",
        className
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 border-t p-4", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col gap-2 pt-4", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
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

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("w-full text-sm", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  size?: "default" | "sm" | "lg";
}) {
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

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
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

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("relative", className)} {...props} />;
}

function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
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

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
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

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};
