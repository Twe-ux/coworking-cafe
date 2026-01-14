import { useRole } from "./useRole";

/**
 * Hook to check specific permissions based on user role
 */
export function usePermissions() {
  const { role, isDev, isAdmin, isStaff } = useRole();

  return {
    // Dashboard
    canViewDashboard: isDev || isAdmin || isStaff,

    // Accounting
    canManageAccounting: isDev || isAdmin,
    canViewAccounting: isDev || isAdmin,

    // Users
    canManageUsers: isDev || isAdmin,
    canViewUsers: isDev || isAdmin,

    // HR (Human Resources)
    canManageHR: isDev || isAdmin,
    canViewHR: isDev || isAdmin,
    canViewOwnHRData: isDev || isAdmin || isStaff,

    // Bookings
    canManageBookings: isDev || isAdmin,
    canViewBookings: isDev || isAdmin || isStaff,

    // Spaces
    canManageSpaces: isDev || isAdmin,
    canViewSpaces: isDev || isAdmin,

    // Products
    canManageProducts: isDev || isAdmin,
    canViewProducts: isDev || isAdmin,

    // Blog
    canManageBlog: isDev || isAdmin,
    canViewBlog: isDev || isAdmin,

    // Analytics
    canViewAnalytics: isDev || isAdmin,

    // Schedule
    canManageAllSchedules: isDev || isAdmin,
    canViewOwnSchedule: isDev || isAdmin || isStaff,

    // Dev Tools
    canAccessDevTools: isDev,

    // Messages & Communication
    canUseMessages: isDev || isAdmin || isStaff,
    canViewNotifications: isDev || isAdmin || isStaff,

    // Profile
    canEditProfile: isDev || isAdmin || isStaff,

    // Role Switcher
    canSwitchRole: isDev,
  };
}
