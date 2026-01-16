"use client";

import { DashCard } from "./DashCard";

interface DashSectionCardsProps {
  checked: boolean; // true = TTC, false = HT
}

/**
 * DashSectionCards - Affiche les 4 cartes de stats financières
 * - Journée précédente
 * - Semaine en cours
 * - Mois en cours
 * - Année en cours
 */
export function DashSectionCards({ checked }: DashSectionCardsProps) {
  return (
    <div className="grid gap-3 px-3 md:gap-4 md:px-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <DashCard
        title="Journée précédente"
        range="yesterday"
        compareRange="customPreviousDay"
        checked={checked}
      />
      <DashCard
        title="Semaine en cours"
        range="week"
        compareRange="customPreviousWeek"
        checked={checked}
      />
      <DashCard
        title="Mois en cours"
        range="month"
        compareRange="customPreviousMonth"
        checked={checked}
      />
      <DashCard
        title="Année en cours"
        range="year"
        compareRange="customPreviousYear"
        checked={checked}
      />
    </div>
  );
}
