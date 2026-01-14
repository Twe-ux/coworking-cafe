"use client";

import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";

/**
 * Page Planning Staff - Lecture seule
 * Affiche uniquement le planning de l'employé connecté
 */
export default function StaffSchedulePage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Mon Planning</h1>
          <p className="text-muted-foreground">
            Consultez vos créneaux de travail
          </p>
        </div>
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Module Planning Staff en cours de migration...
        </p>
      </div>
    </div>
  );
}
