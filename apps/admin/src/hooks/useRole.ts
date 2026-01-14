import { useSession } from "next-auth/react";
import { useRoleSwitcher } from "@/contexts/role-switcher-context";

export type UserRole = "dev" | "admin" | "staff";

export function useRole() {
  const { data: session } = useSession();
  const { selectedRole, canSwitchRole } = useRoleSwitcher();

  // Si le role switcher est actif (dev uniquement), utiliser le rôle sélectionné
  // Sinon utiliser le rôle de la session
  const actualRole = canSwitchRole && selectedRole
    ? (selectedRole.value as UserRole)
    : (session?.user?.role as UserRole | undefined);

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
