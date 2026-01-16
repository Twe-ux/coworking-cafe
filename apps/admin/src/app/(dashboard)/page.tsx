"use client";

import { AccessDeniedMessage, RoleGuard } from "@/components/auth/RoleGuard";
import { Chart } from "@/components/dashboard/Chart";
import { DashSectionCards } from "@/components/dashboard/DashSectionCards";
import SwitchWithText from "@/components/dashboard/SwitchWithText";
import { usePermissions } from "@/hooks/usePermissions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const permissions = usePermissions();
  const [checked, setChecked] = useState(false); // false = HT, true = TTC
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Greeting selon l'heure
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bonjour");
    else if (hour < 18) setGreeting("Bon après-midi");
    else setGreeting("Bonsoir");
  }, []);

  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      {/* Bienvenue personnalisée */}
      <div className="px-3 md:px-0">
        <h1 className="mb-2 text-2xl font-bold">
          {greeting}, {displayName} !
        </h1>
        <p className="text-muted-foreground">
          {permissions.canManageAccounting
            ? "Tableau de bord administrateur - Accès complet aux données financières et de gestion."
            : "Tableau de bord personnel - Gérez vos horaires et consultez vos informations."}
        </p>
      </div>

      {/* Section financière - Visible uniquement pour dev + admin */}
      <RoleGuard
        allowedRoles={["dev", "admin"]}
        fallback={
          <div className="px-3 md:px-0">
            <AccessDeniedMessage message="Contactez un administrateur pour accéder aux données financières." />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Toggle HT/TTC */}
          <div className="flex items-center justify-end px-3 md:px-0">
            <SwitchWithText
              checked={checked}
              setChecked={setChecked}
              firstText="HT"
              secondText="TTC"
            />
          </div>

          {/* Cartes de statistiques */}
          <DashSectionCards checked={checked} />

          {/* Graphiques */}
          <div className="px-3 md:px-0">
            <Chart mode={checked ? "TTC" : "HT"} />
          </div>
        </div>
      </RoleGuard>
    </div>
  );
}
