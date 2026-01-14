/**
 * Utilitaires pour la gestion des dates avec timezone française
 */

const TIMEZONE = "Europe/Paris";

/**
 * Obtient la date et l'heure actuelles en UTC (pour sauvegarde en base)
 * @returns string - Date au format ISO UTC
 */
export function getCurrentDateTimeInUTC(): string {
  return new Date().toISOString();
}

/**
 * Obtient la date et l'heure actuelles en timezone française au format ISO
 * @returns string - Date au format ISO avec timezone française (pour affichage uniquement)
 */
export function getCurrentDateTimeInFrenchTimezone(): string {
  const now = new Date();

  // Obtenir les composants de la date dans la timezone française
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partsObj = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {} as any);

  // Construire la chaîne ISO avec l'heure française locale (sans Z pour indiquer heure locale)
  return `${partsObj.year}-${partsObj.month}-${partsObj.day}T${partsObj.hour}:${partsObj.minute}:${partsObj.second}`;
}

/**
 * Obtient la date actuelle en timezone française au format YYYY-MM-DD
 * @returns string - Date au format YYYY-MM-DD
 */
export function getCurrentDateInFrenchTimezone(): string {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

/**
 * Convertit une date ISO française en format d'affichage
 * @param isoString - Date au format ISO française (depuis la base de données)
 * @returns string - Date formatée pour l'affichage sans conversion
 */
export function formatTimeInFrenchTimezone(isoString: string): string {
  if (!isoString || isoString === "00:00" || isNaN(Date.parse(isoString)))
    return "";

  // Comme l'heure est déjà stockée en timezone française, on l'affiche directement
  // sans conversion supplémentaire
  const date = new Date(isoString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    // Pas de timeZone car l'heure est déjà en heure française
  });
}

/**
 * Crée un objet Date à partir d'une heure locale française
 * @param localTimeString - Heure au format HH:MM
 * @param dateString - Date au format YYYY-MM-DD (optionnel, utilise la date du jour si non fourni)
 * @returns Date - Objet Date avec l'heure locale française
 */
export function createDateFromFrenchTime(
  localTimeString: string,
  dateString?: string,
): Date {
  const today = dateString || getCurrentDateInFrenchTimezone();
  const [hours, minutes] = localTimeString.split(":").map(Number);

  // Créer une date dans la timezone française
  const dateInFrench = new Date(`${today}T${localTimeString}:00`);

  return dateInFrench;
}

/**
 * Obtient l'offset de timezone française en minutes
 * @returns number - Offset en minutes
 */
export function getFrenchTimezoneOffset(): number {
  const now = new Date();
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const french = new Date(utc.toLocaleString("en-US", { timeZone: TIMEZONE }));

  return (french.getTime() - utc.getTime()) / (1000 * 60);
}

export { TIMEZONE };
