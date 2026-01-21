/**
 * Validation Utilities - apps/site
 * Fonctions pour valider les données utilisateur
 */

/**
 * Valider une adresse email
 * @param email Email à valider
 * @returns true si l'email est valide
 * @example validateEmail('test@example.com') => true
 * @example validateEmail('invalid') => false
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valider un numéro de téléphone français
 * @param phone Numéro de téléphone
 * @returns true si le numéro est valide
 * @example validatePhone('0612345678') => true
 * @example validatePhone('+33612345678') => true
 */
export function validatePhone(phone: string): boolean {
  // Supporte: 06XXXXXXXX, +336XXXXXXXX, 0033XXXXXXXX
  const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return regex.test(phone);
}

/**
 * Valider un mot de passe
 * @param password Mot de passe à valider
 * @returns Objet avec le résultat et les erreurs
 * @example validatePassword('Pass123!') => { valid: true, errors: [] }
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valider une date au format YYYY-MM-DD
 * @param dateStr Date à valider
 * @returns true si la date est valide
 * @example validateDate('2026-01-21') => true
 * @example validateDate('2026-13-01') => false
 */
export function validateDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valider une heure au format HH:mm
 * @param timeStr Heure à valider
 * @returns true si l'heure est valide
 * @example validateTime('09:30') => true
 * @example validateTime('25:00') => false
 */
export function validateTime(timeStr: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeStr);
}

/**
 * Valider une plage horaire
 * @param startTime Heure de début
 * @param endTime Heure de fin
 * @returns Objet avec le résultat et un message d'erreur
 */
export function validateTimeRange(
  startTime: string,
  endTime: string
): {
  valid: boolean;
  error?: string;
} {
  if (!validateTime(startTime)) {
    return { valid: false, error: 'Heure de début invalide' };
  }

  if (!validateTime(endTime)) {
    return { valid: false, error: 'Heure de fin invalide' };
  }

  if (startTime >= endTime) {
    return { valid: false, error: "L'heure de fin doit être après l'heure de début" };
  }

  return { valid: true };
}

/**
 * Valider un code postal français
 * @param postalCode Code postal
 * @returns true si le code postal est valide
 * @example validatePostalCode('75001') => true
 * @example validatePostalCode('123') => false
 */
export function validatePostalCode(postalCode: string): boolean {
  const regex = /^[0-9]{5}$/;
  return regex.test(postalCode);
}

/**
 * Valider un code promo
 * @param code Code promo
 * @returns Objet avec le résultat et un message d'erreur
 */
export function validatePromoCode(code: string): {
  valid: boolean;
  error?: string;
} {
  if (code.length < 3) {
    return { valid: false, error: 'Le code promo doit contenir au moins 3 caractères' };
  }

  if (code.length > 20) {
    return { valid: false, error: 'Le code promo ne peut pas dépasser 20 caractères' };
  }

  // Alphanumerique et tirets uniquement
  if (!/^[A-Z0-9-]+$/.test(code)) {
    return {
      valid: false,
      error: 'Le code promo ne peut contenir que des lettres, chiffres et tirets',
    };
  }

  return { valid: true };
}

/**
 * Valider un nombre dans un intervalle
 * @param value Valeur à valider
 * @param min Valeur minimum
 * @param max Valeur maximum
 * @returns Objet avec le résultat et un message d'erreur
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(value)) {
    return { valid: false, error: 'Valeur invalide' };
  }

  if (value < min) {
    return { valid: false, error: `La valeur doit être supérieure ou égale à ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `La valeur doit être inférieure ou égale à ${max}` };
  }

  return { valid: true };
}

/**
 * Valider une URL
 * @param url URL à valider
 * @returns true si l'URL est valide
 * @example validateUrl('https://example.com') => true
 * @example validateUrl('not-a-url') => false
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Nettoyer une string (trim + suppression espaces multiples)
 * @param str String à nettoyer
 * @returns String nettoyée
 * @example sanitizeString('  hello   world  ') => 'hello world'
 */
export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Vérifier si une string contient uniquement des lettres
 * @param str String à vérifier
 * @returns true si la string ne contient que des lettres
 */
export function isAlphabetic(str: string): boolean {
  return /^[a-zA-ZÀ-ÿ\s-]+$/.test(str);
}

/**
 * Vérifier si une string contient uniquement des chiffres
 * @param str String à vérifier
 * @returns true si la string ne contient que des chiffres
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * Valider une capacité (nombre de personnes)
 * @param capacity Capacité à valider
 * @param maxCapacity Capacité maximum autorisée
 * @returns Objet avec le résultat et un message d'erreur
 */
export function validateCapacity(
  capacity: number,
  maxCapacity: number
): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(capacity) || capacity < 1) {
    return { valid: false, error: 'Le nombre de personnes doit être au moins 1' };
  }

  if (capacity > maxCapacity) {
    return {
      valid: false,
      error: `Le nombre de personnes ne peut pas dépasser ${maxCapacity}`,
    };
  }

  return { valid: true };
}

/**
 * Vérifier si une date est future
 * @param dateStr Date au format YYYY-MM-DD
 * @returns true si la date est dans le futur
 */
export function isFutureDate(dateStr: string): boolean {
  if (!validateDate(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

/**
 * Vérifier si une date est dans le passé
 * @param dateStr Date au format YYYY-MM-DD
 * @returns true si la date est dans le passé
 */
export function isPastDate(dateStr: string): boolean {
  if (!validateDate(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}
