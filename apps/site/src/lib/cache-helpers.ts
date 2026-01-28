import { unstable_cache, revalidateTag } from 'next/cache';

/**
 * Cache pour données qui changent rarement (24h)
 * Utilisé pour: menu boissons/food, horaires, espaces, services additionnels
 */
export const cache24h = <T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: { tags?: string[] }
) => {
  return unstable_cache(fn, keyParts, {
    revalidate: 86400, // 24 heures
    tags: options?.tags || keyParts,
  });
};

/**
 * Cache pour données qui changent modérément (1h)
 * Utilisé pour: articles blog, catégories
 */
export const cache1h = <T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: { tags?: string[] }
) => {
  return unstable_cache(fn, keyParts, {
    revalidate: 3600, // 1 heure
    tags: options?.tags || keyParts,
  });
};

/**
 * Cache pour données qui changent fréquemment (5 min)
 * Utilisé pour: disponibilités, réservations
 */
export const cache5min = <T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options?: { tags?: string[] }
) => {
  return unstable_cache(fn, keyParts, {
    revalidate: 300, // 5 minutes
    tags: options?.tags || keyParts,
  });
};

/**
 * Invalider le cache pour un tag spécifique
 * À appeler depuis l'admin après modification des données
 *
 * Exemples:
 * - invalidateCache('menu') - Invalide tout le cache menu
 * - invalidateCache('menu-drink') - Invalide seulement les boissons
 * - invalidateCache('global-hours') - Invalide les horaires
 */
export const invalidateCache = (tag: string) => {
  revalidateTag(tag);
};

/**
 * Tags de cache disponibles
 */
export const CACHE_TAGS = {
  MENU: 'menu',
  MENU_DRINK: 'menu-drink',
  MENU_FOOD: 'menu-food',
  MENU_GROCERY: 'menu-grocery',
  MENU_GOODIES: 'menu-goodies',
  GLOBAL_HOURS: 'global-hours',
  SPACES: 'spaces',
  ADDITIONAL_SERVICES: 'additional-services',
  ARTICLES: 'articles',
  CATEGORIES: 'categories',
} as const;
