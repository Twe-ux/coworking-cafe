"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ReactNode } from "react";

interface Props {
  readonly children: ReactNode;
}

export default function AccountingLayout({ children }: Props) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}
