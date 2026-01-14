/**
 * Centralized space type mapping and labels
 *
 * This file manages the conversion between:
 * - URL slugs (SEO-friendly, English, no accents): "meeting-room-glass"
 * - Database values (French): "salle-verriere"
 * - Display labels (French, user-facing): "Salle Verrière"
 */

export const SPACE_TYPE_MAP = {
  'open-space': 'open-space',
  'meeting-room-glass': 'salle-verriere',
  'meeting-room-floor': 'salle-etage',
  'event-space': 'evenementiel',
} as const;

export const SPACE_TYPE_LABELS = {
  'open-space': 'Open-space',
  'meeting-room-glass': 'Salle Verrière',
  'meeting-room-floor': 'Salle de l\'Étage',
  'event-space': 'Événementiel',
} as const;

// Alternative: labels by DB type
export const DB_SPACE_TYPE_LABELS = {
  'open-space': 'Open-space',
  'salle-verriere': 'Salle Verrière',
  'salle-etage': 'Salle de l\'Étage',
  'evenementiel': 'Événementiel',
} as const;

/**
 * Convert URL slug to database space type
 * @param urlSlug - URL-friendly slug (e.g., "meeting-room-glass")
 * @returns Database space type (e.g., "salle-verriere")
 */
export function urlToDbSpaceType(urlSlug: string): string {
  return SPACE_TYPE_MAP[urlSlug as keyof typeof SPACE_TYPE_MAP] || urlSlug;
}

/**
 * Convert database space type to URL slug
 * @param dbType - Database space type (e.g., "salle-verriere")
 * @returns URL-friendly slug (e.g., "meeting-room-glass")
 */
export function dbToUrlSpaceType(dbType: string): string {
  const entry = Object.entries(SPACE_TYPE_MAP)
    .find(([_, db]) => db === dbType);
  return entry ? entry[0] : dbType;
}

/**
 * Get display label from URL slug
 * @param urlSlug - URL-friendly slug (e.g., "meeting-room-glass")
 * @returns Display label (e.g., "Salle Verrière")
 */
export function getSpaceTypeLabel(urlSlug: string): string {
  return SPACE_TYPE_LABELS[urlSlug as keyof typeof SPACE_TYPE_LABELS] || urlSlug;
}

/**
 * Get display label from database space type
 * @param dbType - Database space type (e.g., "salle-verriere")
 * @returns Display label (e.g., "Salle Verrière")
 */
export function getDbSpaceTypeLabel(dbType: string): string {
  return DB_SPACE_TYPE_LABELS[dbType as keyof typeof DB_SPACE_TYPE_LABELS] || dbType;
}
