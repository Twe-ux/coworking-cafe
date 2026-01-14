"use client";

import StaffCard from "@/components/dashboard/staff/staff-card";
import { useStaffDataFixed } from "@/hooks/use-staff-data-fixed";
import * as React from "react";

export default function ScoreCard({ hidden }: { hidden: string }) {
  const [isClient, setIsClient] = React.useState(false);
  const { data, isLoading, error, refresh } = useStaffDataFixed();

  // S'assurer que le composant s'affiche côté client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug logs pour vérifier les données
  React.useEffect(() => {
    console.log("🎯 SCORE CARD: Data update", {
      isLoading,
      hasData: !!data,
      count: data?.length || 0,
      error,
      data: data?.map((s) => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        isActive: s.isActive,
      })),
    });
  }, [data, isLoading, error]);

  if (!isClient || isLoading) {
    return (
      <div className="">
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="text-destructive text-center">
          Erreur de chargement: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Bouton de debug temporaire */}
      <div className="mb-2 px-4">
        <button
          onClick={() => {
            console.log("🔄 MANUAL REFRESH SCORE CARD");
            refresh();
          }}
          className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
        >
          Refresh ScoreCard
        </button>
      </div>

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-6">
        {data?.map(
          (staff) =>
            staff.isActive && ( // Utiliser le nouveau champ isActive
              <StaffCard
                key={`${staff.id} + ${staff.lastName}`}
                firstname={staff.firstName}
                lastname={staff.lastName}
                mdp={staff.mdp} // Assuming mdp is a property of the staff object
                staffId={staff.id} // Use the actual ID from the staff object
                hidden={hidden}
              />
            ),
        )}
      </div>
    </div>
  );
}
