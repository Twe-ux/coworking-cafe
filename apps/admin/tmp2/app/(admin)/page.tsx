"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { Chart } from "@/components/dashboard/chart";
import { DashSectionCards } from "@/components/dashboard/section-card";
import ScoreCard from "@/components/dashboard/staff/score/score-card";
import SwitchWithText from "@/components/dashboard/switch-with-text";
import { useAuth } from "@/contexts/AuthContext";
import {
  diagnoseDashboardCache,
  invalidateDashboardCache,
} from "@/hooks/use-dashboard-data-fixed";
import { useAutoPreloader } from "@/hooks/use-global-preloader";
import { useState } from "react";
// Imports pour la section debug (décommenter si nécessaire)
// import { Button } from "@/components/ui/button";
// import { Loader2, RefreshCw, Zap } from "lucide-react";

export default function DashboardPage() {
  const [checked, setChecked] = useState(false);
  const { user, hasRole } = useAuth();

  // Préchargement automatique de toutes les APIs
  const { startPreload } = useAutoPreloader();

  const handleRefresh = () => {
    console.log("🔄 MANUAL REFRESH: User clicked refresh button");

    // Diagnostique avant refresh
    diagnoseDashboardCache();

    // Invalider le cache et forcer un refresh
    invalidateDashboardCache();

    // Attendre un peu puis recharger
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 md:gap-6 md:py-6">
        {/* Bienvenue personnalisée */}
        <div className="px-4 lg:px-6">
          <h1 className="mb-2 text-2xl font-bold">
            Bienvenue, {user?.firstName} !
          </h1>
          <p className="text-muted-foreground">
            {hasRole("admin")
              ? "Tableau de bord administrateur - Accès complet aux données financières et de gestion."
              : "Tableau de bord personnel - Gérez vos pointages et consultez vos informations."}
          </p>
        </div>

        <ScoreCard hidden={""} />

        {/* Section financière - Visible uniquement pour les admins */}
        <RoleGuard role="admin">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between px-8">
              <div className="flex gap-2">
                {/* Section pour les contrôles de debug si nécessaire */}
              </div>

              <SwitchWithText
                checked={checked}
                setChecked={setChecked}
                firstText="HT"
                secondText="TTC"
              />
            </div>
            <DashSectionCards checked={checked} />
            <div className="px-4 lg:px-6">
              <Chart />
            </div>
          </div>
        </RoleGuard>

        {/* Message pour les utilisateurs staff sans accès admin */}
        {!hasRole("admin") && (
          <div className="px-4 lg:px-6">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                Contactez un administrateur pour accéder aux données
                financières.
              </p>
            </div>
          </div>
        )}

        {/* ===== SECTION DEBUG - Décommenter si nécessaire ===== */}
        {/* <div className="-mb-6 rounded-b-xl border-2 border-gray-300 bg-gray-200 px-8 py-4">
          <h3 className="mb-3 text-sm font-medium text-gray-700">
            Outils de Debug
          </h3>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh Debug
            </Button>

            <Button
              variant={isComplete ? "default" : "outline"}
              size="sm"
              onClick={startPreload}
              disabled={isPreloading}
              className="text-xs"
            >
              {isPreloading ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : isComplete ? (
                <Zap className="mr-1 h-3 w-3" />
              ) : (
                <Zap className="mr-1 h-3 w-3" />
              )}
              {isPreloading
                ? `Préchargement... ${progress}%`
                : isComplete
                  ? "APIs Préchargées ✓"
                  : "Précharger APIs"}
            </Button>

            {(isPreloading || isComplete) && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>
                  {completedApis}/{totalApis} APIs
                </span>
                {isComplete && (
                  <span className="text-green-600">✓ Complet</span>
                )}
                {errors.length > 0 && (
                  <span className="text-red-600">
                    ({errors.length} erreurs)
                  </span>
                )}
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
