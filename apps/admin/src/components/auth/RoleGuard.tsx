"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useRole, UserRole } from "@/hooks/useRole";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  /**
   * Required role to view the content
   * @example role="admin" - Only admin and dev can see
   */
  role?: UserRole;
  /**
   * List of allowed roles
   * @example allowedRoles={["dev", "admin"]}
   */
  allowedRoles?: UserRole[];
  /**
   * Custom permission check
   * @example permission="canManageAccounting"
   */
  permission?: keyof ReturnType<typeof usePermissions>;
  /**
   * Fallback component when access is denied
   */
  fallback?: ReactNode;
  /**
   * Show nothing instead of fallback
   */
  hideOnDenied?: boolean;
}

/**
 * RoleGuard - Protège le contenu selon le rôle de l'utilisateur
 *
 * @example
 * // Protéger pour admin uniquement
 * <RoleGuard role="admin">
 *   <AdminContent />
 * </RoleGuard>
 *
 * @example
 * // Protéger pour plusieurs rôles
 * <RoleGuard allowedRoles={["dev", "admin"]}>
 *   <RestrictedContent />
 * </RoleGuard>
 *
 * @example
 * // Utiliser une permission custom
 * <RoleGuard permission="canManageAccounting">
 *   <AccountingSection />
 * </RoleGuard>
 *
 * @example
 * // Avec fallback personnalisé
 * <RoleGuard role="admin" fallback={<AccessDeniedMessage />}>
 *   <SensitiveData />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  role,
  allowedRoles,
  permission,
  fallback,
  hideOnDenied = false,
}: RoleGuardProps) {
  const { role: userRole, canAccess } = useRole();
  const permissions = usePermissions();

  // Check access based on props
  let hasAccess = false;

  if (permission) {
    // Check custom permission
    hasAccess = permissions[permission] as boolean;
  } else if (allowedRoles) {
    // Check if user role is in allowed roles
    hasAccess = userRole ? allowedRoles.includes(userRole) : false;
  } else if (role) {
    // Check minimum required role (hierarchical)
    hasAccess = canAccess(role);
  } else {
    // No restriction, allow access
    hasAccess = true;
  }

  // Render logic
  if (hasAccess) {
    return <>{children}</>;
  }

  if (hideOnDenied) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-muted-foreground">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
        section.
      </p>
    </div>
  );
}

/**
 * AccessDeniedMessage - Message par défaut d'accès refusé
 */
export function AccessDeniedMessage({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-muted-foreground">
        {message ||
          "Contactez un administrateur pour accéder à cette section."}
      </p>
    </div>
  );
}
