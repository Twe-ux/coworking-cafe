/**
 * Sidebar components - Re-export from modular structure
 *
 * This file maintains backward compatibility by re-exporting
 * all components from the modular /sidebar/ directory.
 *
 * Original 629-line file refactored into:
 * - types.ts (types and interfaces)
 * - context.ts (SidebarContext + useSidebar hook)
 * - SidebarProvider.tsx (112 lines)
 * - Sidebar.tsx (197 lines)
 * - SidebarTrigger.tsx (47 lines)
 * - SidebarRail.tsx (20 lines)
 * - SidebarInset.tsx (23 lines)
 * - SidebarContent.tsx (92 lines)
 * - SidebarMenu.tsx (191 lines)
 * - index.ts (central exports)
 *
 * Each file < 200 lines for maintainability
 */

export {
  // Context and hook
  SidebarContext,
  useSidebar,

  // Types
  type SidebarContextProps,
  type SidebarProviderProps,
  type SidebarProps,
  type SidebarMenuButtonProps,
  type SidebarMenuSubButtonProps,
  type SidebarMenuActionProps,
  type SidebarGroupLabelProps,

  // Main components
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,

  // Content components
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,

  // Menu components
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from "./sidebar/index";
