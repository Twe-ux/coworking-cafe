/**
 * Get space type from space name
 */
export function getSpaceType(spaceName?: string): string {
  if (!spaceName) return "open-space";
  const lower = spaceName.toLowerCase();
  if (lower.includes("verriere")) return "salle-verriere";
  if (lower.includes("etage")) return "salle-etage";
  if (lower.includes("evenement")) return "evenementiel";
  return "open-space";
}

/**
 * Get border class based on space type
 */
export function getBorderClassBySpace(spaceName?: string): string {
  const spaceType = getSpaceType(spaceName);
  const spaceTypeColors: Record<string, string> = {
    "open-space": "border-l-blue-500",
    "salle-verriere": "border-l-green-500",
    "salle-etage": "border-l-purple-500",
    evenementiel: "border-l-red-500",
  };
  return `border-l-4 ${spaceTypeColors[spaceType]}`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(name?: string): string {
  if (!name) return "";
  return name.replace(/(^|[\s-])[a-zA-ZÀ-ÿ]/g, (c) => c.toUpperCase());
}
