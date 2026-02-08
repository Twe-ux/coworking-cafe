// ============================================================================
// BOOKING SELECTION TYPES
// ============================================================================
// Types spécifiques pour la page de sélection d'espaces
// Created: 2026-02-08
// ============================================================================

/**
 * Space Configuration from API
 * Configuration d'espace retournée par l'API
 */
export interface SpaceConfig {
  spaceType: string;
  name: string;
  slug: string;
  description?: string;
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    perPerson: boolean;
  };
  availableReservationTypes: {
    hourly: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  requiresQuote: boolean;
  minCapacity: number;
  maxCapacity: number;
  imageUrl?: string;
  displayOrder: number;
  features?: string[];
}

/**
 * Display Space
 * Espace formaté pour affichage dans l'UI
 */
export interface DisplaySpace {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  capacity: string;
  features: string[];
  priceFrom: string;
  hourlyPrice: string;
  dailyPrice: string;
  requiresQuote: boolean;
}

/**
 * Space Card Props
 * Props pour le composant SpaceCard
 */
export interface SpaceCardProps {
  space: DisplaySpace;
  showTTC: boolean;
  onConvertPrice: (price: string, toTTC: boolean) => string;
}

/**
 * Space Grid Props
 * Props pour le composant SpaceGrid
 */
export interface SpaceGridProps {
  spaces: DisplaySpace[];
  showTTC: boolean;
  onConvertPrice: (price: string, toTTC: boolean) => string;
}

/**
 * Selection Header Props
 * Props pour le composant SelectionHeader
 */
export interface SelectionHeaderProps {
  showTTC: boolean;
  onToggleTTC: (value: boolean) => void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Mapping DB spaceType to URL slug
 */
export const SPACE_TYPE_TO_SLUG: Record<string, string> = {
  "open-space": "open-space",
  "salle-verriere": "meeting-room-glass",
  "salle-etage": "meeting-room-floor",
  evenementiel: "event-space",
};

/**
 * Static display data (icons only - features come from DB)
 */
export const SPACE_DISPLAY_DATA: Record<string, Partial<DisplaySpace>> = {
  "open-space": {
    title: "Place",
    subtitle: "Open-space",
    icon: "bi-person-workspace",
  },
  "salle-verriere": {
    title: "Salle de réunion",
    subtitle: "Verrière",
    icon: "bi-briefcase",
  },
  "salle-etage": {
    title: "Salle de réunion",
    subtitle: "Étage",
    icon: "bi-building",
  },
  evenementiel: {
    title: "Événementiel",
    subtitle: "Grand espace",
    icon: "bi-calendar-event",
  },
};
