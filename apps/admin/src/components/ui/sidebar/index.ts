/**
 * Sidebar components - Modular structure
 * Refactored from single 629-line file to modular components
 * Each file < 200 lines for maintainability
 */

// Context and hook
export { SidebarContext, useSidebar } from "./context";

// Types
export type {
  SidebarContextProps,
  SidebarProviderProps,
  SidebarProps,
  SidebarMenuButtonProps,
  SidebarMenuSubButtonProps,
  SidebarMenuActionProps,
  SidebarGroupLabelProps,
} from "./types";

// Main components
export { SidebarProvider } from "./SidebarProvider";
export { Sidebar } from "./Sidebar";
export { SidebarTrigger } from "./SidebarTrigger";
export { SidebarRail } from "./SidebarRail";
export { SidebarInset } from "./SidebarInset";

// Content components
export {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "./SidebarContent";

// Menu components
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from "./SidebarMenu";
