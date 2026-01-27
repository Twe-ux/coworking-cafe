/**
 * Centralized space type mapping and labels for emails
 * Maps database values to French display names
 */

export const DB_SPACE_TYPE_LABELS: Record<string, string> = {
  'open-space': 'Open-space',
  'salle-verriere': 'Salle Verrière',
  'salle-etage': 'Salle de l\'Étage',
  'evenementiel': 'Événementiel',
}

export const SPACE_TYPE_LABELS: Record<string, string> = {
  'open-space': 'Open-space',
  'meeting-room-glass': 'Salle Verrière',
  'meeting-room-floor': 'Salle de l\'Étage',
  'event-space': 'Événementiel',
}

/**
 * Get display label from URL slug
 */
export function getSpaceTypeLabel(urlSlug: string): string {
  return SPACE_TYPE_LABELS[urlSlug] || urlSlug
}

/**
 * Get display label from database space type
 */
export function getDbSpaceTypeLabel(dbType: string): string {
  return DB_SPACE_TYPE_LABELS[dbType] || dbType
}
