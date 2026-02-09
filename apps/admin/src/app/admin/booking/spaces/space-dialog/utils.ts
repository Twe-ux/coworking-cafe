/**
 * Generate URL-friendly slug from space name
 *
 * @param name - Space name to convert
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Parse features string into array
 *
 * @param featuresInput - Comma-separated features string
 * @returns Array of trimmed features
 */
export function parseFeatures(featuresInput: string): string[] {
  return featuresInput
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f.length > 0)
}

/**
 * Get default form data for new space
 *
 * @returns Default SpaceFormData
 */
export function getDefaultFormData() {
  return {
    name: "",
    spaceType: "open-space" as const,
    slug: "",
    description: "",
    minCapacity: 1,
    maxCapacity: 10,
    pricing: {
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: true,
      daily: true,
      weekly: false,
      monthly: false,
    },
    depositPolicy: {
      enabled: false,
      percentage: undefined,
      fixedAmount: undefined,
      minimumAmount: undefined,
    },
    requiresQuote: false,
    isActive: true,
    displayOrder: 0,
    features: [],
  }
}
