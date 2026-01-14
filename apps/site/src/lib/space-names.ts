/**
 * Utility function to map spaceType to French display names
 */

export const SPACE_TYPE_NAMES: Record<string, string> = {
  'open-space': 'Open Space',
  'salle-verriere': 'Salle Verrière',
  'salle-etage': 'Salle Étage',
  'evenementiel': 'Événementiel',
  'desk': 'Bureau',
  'meeting-room': 'Salle de Réunion',
  'meeting-room-glass': 'Salle Verrière',
  'meeting-room-floor': 'Salle Étage',
  'private-office': 'Bureau Privé',
  'event-space': 'Espace Événementiel',
};

/**
 * Get French display name for a space type
 */
export function getSpaceTypeName(spaceType: string): string {
  return SPACE_TYPE_NAMES[spaceType] || spaceType;
}
