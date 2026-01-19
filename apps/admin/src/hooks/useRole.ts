import { useSession } from "next-auth/react";

export type UserRole = "dev" | "admin" | "staff";

export function useRole() {
  const { data: session } = useSession();

  // Utiliser directement le rôle de la session
  const actualRole = session?.user?.role as UserRole | undefined;

  return {
    role: actualRole,
    isDev: actualRole === "dev",
    isAdmin: actualRole === "admin",
    isStaff: actualRole === "staff",
    /**
     * Check if user can access a specific section
     * @param requiredRole - Minimum role required
     */
    canAccess: (requiredRole: UserRole): boolean => {
      if (!actualRole) return false;

      const roleHierarchy: Record<UserRole, number> = {
        dev: 100,
        admin: 80,
        staff: 50,
      };

      return roleHierarchy[actualRole] >= roleHierarchy[requiredRole];
    },
  };
}
