import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";

// Types pour la sidebar
export type SidebarState = "expanded" | "collapsed";

export type SidebarContextProps = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

// Hook pour gérer l'état de la sidebar
export function useSidebarState(defaultOpen = true) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // État local pour le desktop
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = isMobile ? openMobile : _open;

  const setOpen = React.useCallback(
    (value: boolean | ((open: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;

      if (isMobile) {
        setOpenMobile(openState);
      } else {
        _setOpen(openState);

        // Sauvegarder l'état dans les cookies pour le desktop
        document.cookie = `sidebar_state=${openState ? "expanded" : "collapsed"}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }
    },
    [open, isMobile],
  );

  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  // État dérivé
  const state: SidebarState = open ? "expanded" : "collapsed";

  return {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };
}

// Hook pour gérer les raccourcis clavier
export function useSidebarKeyboard(toggleSidebar: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);
}

// Hook pour récupérer l'état depuis les cookies
export function useSidebarCookie(): boolean {
  const [defaultOpen, setDefaultOpen] = React.useState(true);

  React.useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="));

    if (cookie) {
      const value = cookie.split("=")[1];
      setDefaultOpen(value === "expanded");
    }
  }, []);

  return defaultOpen;
}

// Constantes pour la sidebar
export const SIDEBAR_CONFIG = {
  COOKIE_NAME: "sidebar_state",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
  WIDTH: "16rem",
  WIDTH_MOBILE: "18rem",
  WIDTH_ICON: "3rem",
  KEYBOARD_SHORTCUT: "b",
} as const;

// Hook pour gérer la largeur dynamique
export function useSidebarWidth(state: SidebarState, isMobile: boolean) {
  return React.useMemo(() => {
    if (isMobile) {
      return SIDEBAR_CONFIG.WIDTH_MOBILE;
    }
    return state === "expanded"
      ? SIDEBAR_CONFIG.WIDTH
      : SIDEBAR_CONFIG.WIDTH_ICON;
  }, [state, isMobile]);
}

// Hook pour la gestion des variables CSS
export function useSidebarCSS(state: SidebarState, isMobile: boolean) {
  const width = useSidebarWidth(state, isMobile);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", width);
    root.style.setProperty("--sidebar-width-icon", SIDEBAR_CONFIG.WIDTH_ICON);
  }, [width]);
}

// Types utilitaires
export type SidebarSize = "default" | "sm" | "lg";
export type SidebarVariant = "default" | "inset" | "sidebar";

// Utilitaires pour les classes CSS
export const sidebarUtils = {
  getStateClass: (state: SidebarState) => {
    return state === "collapsed" ? "sidebar-collapsed" : "sidebar-expanded";
  },

  getSizeClass: (size: SidebarSize) => {
    switch (size) {
      case "sm":
        return "sidebar-sm";
      case "lg":
        return "sidebar-lg";
      default:
        return "sidebar-default";
    }
  },

  getVariantClass: (variant: SidebarVariant) => {
    switch (variant) {
      case "inset":
        return "sidebar-inset";
      case "sidebar":
        return "sidebar-sidebar";
      default:
        return "sidebar-default";
    }
  },

  combineClasses: (...classes: (string | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  },
};

// Types pour les props des composants
export type SidebarHookResult = ReturnType<typeof useSidebarState>;
