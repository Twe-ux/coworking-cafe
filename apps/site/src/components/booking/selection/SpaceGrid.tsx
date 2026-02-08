// ============================================================================
// SPACE GRID COMPONENT
// ============================================================================
// Grille de cartes d'espaces
// Created: 2026-02-08
// ============================================================================

import SpaceCard from "./SpaceCard";
import type { SpaceGridProps } from "./types";

export default function SpaceGrid({
  spaces,
  showTTC,
  onConvertPrice,
}: SpaceGridProps) {
  return (
    <div className="row g-4 justify-content-center">
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          space={space}
          showTTC={showTTC}
          onConvertPrice={onConvertPrice}
        />
      ))}
    </div>
  );
}
