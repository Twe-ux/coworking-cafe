"use client";

import { useSession } from "next-auth/react";
import { usePromo } from "@/hooks/usePromo";
import { PromoStatsCards } from "@/components/promo/PromoStatsCards";
import { PromoWeeklyChart } from "@/components/promo/PromoWeeklyChart";
import { PromoTopHours } from "@/components/promo/PromoTopHours";
import { PromoCurrentCode } from "@/components/promo/PromoCurrentCode";
import { PromoCreateForm } from "@/components/promo/PromoCreateForm";
import { PromoMarketingForm } from "@/components/promo/PromoMarketingForm";
import { PromoHistory } from "@/components/promo/PromoHistory";
import { PromoPageSkeleton } from "@/components/promo/PromoPageSkeleton";
import { StyledAlert } from "@/components/ui/styled-alert";

/**
 * Page Promo - S'adapte selon le rôle utilisateur
 *
 * - **Staff** : Vue simplifiée (code actuel + stats)
 * - **Admin/Dev** : Vue complète (toutes fonctionnalités)
 */
export default function PromoPage() {
  const { data: session } = useSession();
  const { promoData, loading, error, createPromoCode, updateMarketing } =
    usePromo();

  // Déterminer le rôle (staff ou admin/dev)
  const userRole = session?.user?.role;
  const isStaff = userRole === "staff";

  // Loading state
  if (loading) {
    return <PromoPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <StyledAlert variant="destructive">{error}</StyledAlert>
      </div>
    );
  }

  // No data state - Proposer d'initialiser
  if (!promoData) {
    const handleInit = async () => {
      try {
        const response = await fetch("/api/promo/init", { method: "POST" });
        const data = await response.json();

        if (data.success) {
          window.location.reload();
        } else {
          alert("Erreur: " + data.error);
        }
      } catch (error) {
        alert("Erreur lors de l'initialisation");
      }
    };

    return (
      <div className="p-6 space-y-4">
        <StyledAlert variant="info">
          Aucune configuration promo n'existe encore en base de données.
        </StyledAlert>
        {!isStaff && (
          <button
            onClick={handleInit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Initialiser la configuration promo
          </button>
        )}
      </div>
    );
  }

  // Vue simplifiée pour Staff
  if (isStaff) {
    return (
      <div className="space-y-6 p-6 animate-in fade-in duration-700">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Code Promo du Jour</h1>
          <p className="text-muted-foreground">
            Informations et statistiques du code promo actif
          </p>
        </div>

        {/* Code actuel centré */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <PromoCurrentCode promoCode={promoData.current} />
          </div>
        </div>

        {/* Stats (3 cartes seulement) */}
        <PromoStatsCards scanStats={promoData.scanStats} />
      </div>
    );
  }

  // Transform scansByDay to weekly stats format
  const weeklyStats = promoData?.scanStats?.scansByDay
    ? Object.entries(promoData.scanStats.scansByDay)
        .map(([date, scans]) => ({ date, scans: scans as number }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7) // Last 7 days
    : [];

  // Transform scansByHour to top hours format
  const topHours = promoData?.scanStats?.scansByHour
    ? Object.entries(promoData.scanStats.scansByHour)
        .map(([hour, count]) => ({
          hour,
          count: count as number,
          percentage:
            promoData.scanStats.totalScans > 0
              ? Math.round(
                  ((count as number) / promoData.scanStats.totalScans) * 100
                )
              : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5) // Top 5 hours
    : [];

  // Vue complète pour Admin/Dev
  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Module Promo - Administration</h1>
        <p className="text-muted-foreground">
          Gestion complète des codes promo et statistiques
        </p>
      </div>

      {/* Stats Cards (4 cartes) */}
      <PromoStatsCards scanStats={promoData.scanStats} />

      {/* Graphique + Top Heures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromoWeeklyChart weeklyStats={weeklyStats} />
        <PromoTopHours topHours={topHours} />
      </div>

      {/* Formulaire marketing + Formulaire création + Code actuel  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromoMarketingForm
          initialData={promoData.marketing}
          onSubmit={updateMarketing}
        />
        <div className="grid grid-cols-1  gap-6">
          <PromoCreateForm onSubmit={createPromoCode} />
          <PromoCurrentCode promoCode={promoData.current} />
        </div>
      </div>

      {/* Historique */}
      <div className="">
        <PromoHistory history={promoData.history} maxItems={10} />
      </div>
    </div>
  );
}
