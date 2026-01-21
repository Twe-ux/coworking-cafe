/**
 * Slugify Utilities - apps/site
 * Fonctions pour créer des slugs URL-friendly
 */

/**
 * Convertir une string en slug URL-friendly
 * @param text Texte à convertir
 * @returns Slug URL-friendly
 * @example slugify('Hello World!') => 'hello-world'
 * @example slugify('Café & Thé') => 'cafe-et-the'
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/[^\w\-]+/g, '') // Supprimer caractères non-alphanumériques
    .replace(/\-\-+/g, '-') // Remplacer tirets multiples par un seul
    .replace(/^-+/, '') // Supprimer tiret au début
    .replace(/-+$/, ''); // Supprimer tiret à la fin
}

/**
 * Générer un slug unique en ajoutant un suffixe numérique
 * @param text Texte de base
 * @param existingSlugs Liste des slugs existants
 * @returns Slug unique
 * @example generateUniqueSlug('hello', ['hello', 'hello-1']) => 'hello-2'
 */
export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  const baseSlug = slugify(text);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Extraire le titre depuis un slug
 * @param slug Slug à convertir
 * @returns Titre lisible
 * @example unslugify('hello-world') => 'Hello World'
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Vérifier si un slug est valide
 * @param slug Slug à valider
 * @returns true si le slug est valide
 * @example isValidSlug('hello-world') => true
 * @example isValidSlug('Hello World!') => false
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Tronquer un slug à une longueur maximale
 * @param slug Slug à tronquer
 * @param maxLength Longueur maximale
 * @returns Slug tronqué
 * @example truncateSlug('hello-world-foo-bar', 15) => 'hello-world-foo'
 */
export function truncateSlug(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) {
    return slug;
  }

  const truncated = slug.slice(0, maxLength);
  const lastDashIndex = truncated.lastIndexOf('-');

  // Supprimer le dernier mot incomplet
  return lastDashIndex > 0 ? truncated.slice(0, lastDashIndex) : truncated;
}
