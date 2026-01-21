'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: 'dev' | 'admin' | 'staff' | 'client';
  requiredLevel?: number;
  fallback?: ReactNode;
}

export default function PermissionGuard({
  children,
  requiredRole,
  requiredLevel,
  fallback = null,
}: PermissionGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <>{fallback}</>;
  }

  if (!session) {
    return <>{fallback}</>;
  }

  const userRole = session.user.role;

  // Check role slug
  if (requiredRole && userRole.slug !== requiredRole) {
    // Allow higher roles to access
    const roleHierarchy = ['client', 'staff', 'admin', 'dev'];
    const userRoleIndex = roleHierarchy.indexOf(userRole.slug);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    if (userRoleIndex < requiredRoleIndex) {
      return <>{fallback}</>;
    }
  }

  // Check role level
  if (requiredLevel && userRole.level < requiredLevel) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
