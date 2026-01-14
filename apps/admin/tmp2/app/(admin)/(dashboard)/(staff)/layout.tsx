"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReactNode } from "react";

interface Props {
  readonly children: ReactNode;
}

export default function StaffAdminLayout({ children }: Props) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}
