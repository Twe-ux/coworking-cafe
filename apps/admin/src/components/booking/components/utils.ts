export const SPACE_TYPE_COLORS: Record<string, string> = {
  "open-space": "border-l-blue-500",
  "salle-verriere": "border-l-green-500",
  "salle-etage": "border-l-purple-500",
  evenementiel: "border-l-red-500",
};

export function getSpaceType(spaceName?: string): string {
  if (!spaceName) return "open-space";
  const lower = spaceName.toLowerCase();
  if (lower.includes("verriere")) return "salle-verriere";
  if (lower.includes("etage")) return "salle-etage";
  if (lower.includes("evenement")) return "evenementiel";
  return "open-space";
}
