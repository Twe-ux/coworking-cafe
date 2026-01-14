"use client";

import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  role: "admin" | "staff";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
