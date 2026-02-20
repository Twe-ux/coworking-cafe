/**
 * Get border class based on space type
 * Supports both old and new space type keys
 */
export function getBorderClassBySpace(spaceType?: string): string {
  if (!spaceType) return "border-l-4 border-l-blue-500";

  const spaceTypeColors: Record<string, string> = {
    "open-space": "border-l-blue-500",
    "meeting-room-glass": "border-l-green-500",
    "meeting-room-floor": "border-l-purple-500",
    "event-space": "border-l-red-500",
    // Legacy keys (backward compatibility)
    "salle-verriere": "border-l-green-500",
    "salle-etage": "border-l-purple-500",
    "evenementiel": "border-l-red-500",
  };
  return `border-l-4 ${spaceTypeColors[spaceType] || "border-l-blue-500"}`;
}
