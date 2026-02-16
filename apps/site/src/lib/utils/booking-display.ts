/**
 * Booking display utilities
 * Handles formatting of booking information for display
 */

/**
 * Tier configuration for each space type
 * Defines the person count ranges (paliers) for pricing
 */
const SPACE_TIERS: Record<string, { min: number; max: number }> = {
  'salle-verriere': { min: 1, max: 4 },
  'salle-etage': { min: 1, max: 10 },
  // open-space and evenementiel don't have tiers, display exact count
};

/**
 * Get formatted people count label with tier display
 *
 * @param numberOfPeople - Actual number of people
 * @param spaceType - Space type (DB format: "salle-verriere", "salle-etage", etc.)
 * @returns Formatted label (e.g., "1-4 pers" or "5 pers")
 *
 * @example
 * getPeopleDisplayLabel(2, "salle-verriere") // → "1-4 pers"
 * getPeopleDisplayLabel(5, "salle-verriere") // → "5 pers" (exceeds tier)
 * getPeopleDisplayLabel(3, "open-space") // → "3 pers" (no tier)
 */
export function getPeopleDisplayLabel(
  numberOfPeople: number,
  spaceType: string
): string {
  const tier = SPACE_TIERS[spaceType];

  // If no tier defined for this space, show exact count
  if (!tier) {
    return `${numberOfPeople} ${numberOfPeople > 1 ? 'pers' : 'pers'}`;
  }

  // If within tier range, show the tier range
  if (numberOfPeople >= tier.min && numberOfPeople <= tier.max) {
    return `${tier.min}-${tier.max} pers`;
  }

  // If exceeds tier, show exact count
  return `${numberOfPeople} pers`;
}

/**
 * Get formatted people count label with full word
 *
 * @param numberOfPeople - Actual number of people
 * @param spaceType - Space type (DB format)
 * @returns Formatted label with full word (e.g., "1-4 personnes" or "5 personnes")
 */
export function getPeopleDisplayLabelLong(
  numberOfPeople: number,
  spaceType: string
): string {
  const tier = SPACE_TIERS[spaceType];

  // If no tier defined for this space, show exact count
  if (!tier) {
    return `${numberOfPeople} ${numberOfPeople > 1 ? 'personnes' : 'personne'}`;
  }

  // If within tier range, show the tier range
  if (numberOfPeople >= tier.min && numberOfPeople <= tier.max) {
    return `${tier.min}-${tier.max} personnes`;
  }

  // If exceeds tier, show exact count
  return `${numberOfPeople} ${numberOfPeople > 1 ? 'personnes' : 'personne'}`;
}
