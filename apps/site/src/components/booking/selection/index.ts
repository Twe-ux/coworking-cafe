// ============================================================================
// BOOKING SELECTION - BARREL EXPORTS
// ============================================================================
// Point d'entrée centralisé pour tous les composants de sélection
// Created: 2026-02-08
// ============================================================================

export { default as SelectionHeader } from "./SelectionHeader";
export { default as SpaceCard } from "./SpaceCard";
export { default as SpaceGrid } from "./SpaceGrid";
export { useSpaceSelection } from "./useSpaceSelection";

export type {
  SpaceConfig,
  DisplaySpace,
  SpaceCardProps,
  SpaceGridProps,
  SelectionHeaderProps,
} from "./types";

export {
  SPACE_TYPE_TO_SLUG,
  SPACE_DISPLAY_DATA,
} from "./types";
