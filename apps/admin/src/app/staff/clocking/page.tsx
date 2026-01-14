"use client";

import { useSession } from "next-auth/react";
import { Clock } from "lucide-react";

/**
 * Page Pointage Staff
 * Permet au staff de pointer (clock-in/clock-out) et voir ses stats
 */
export default function StaffClockingPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pointage</h1>
          <p className="text-muted-foreground">
            Enregistrez vos heures de travail
          </p>
        </div>
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Module Pointage en cours de migration...
        </p>
      </div>
    </div>
  );
}
