/**
 * Price Formatting Utilities - apps/site
 * Fonctions pour formater les montants et prix
 */

/**
 * Formater un prix en euros
 * @param price Prix en euros (nombre décimal)
 * @returns String formaté avec symbole €
 * @example formatPrice(50) => '50,00 €'
 * @example formatPrice(12.5) => '12,50 €'
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formater un prix en euros (version compacte)
 * @param price Prix en euros
 * @returns String formaté sans décimales si entier
 * @example formatPriceCompact(50) => '50 €'
 * @example formatPriceCompact(12.5) => '12,50 €'
 */
export function formatPriceCompact(price: number): string {
  if (Number.isInteger(price)) {
    return `${price} €`;
  }
  return formatPrice(price);
}

/**
 * Convertir euros en centimes (pour Stripe)
 * @param euros Prix en euros
 * @returns Prix en centimes (arrondi)
 * @example toCents(50) => 5000
 * @example toCents(12.50) => 1250
 */
export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convertir centimes en euros
 * @param cents Prix en centimes
 * @returns Prix en euros
 * @example fromCents(5000) => 50
 * @example fromCents(1250) => 12.5
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Calculer pourcentage de réduction
 * @param originalPrice Prix original
 * @param discountedPrice Prix après réduction
 * @returns Pourcentage de réduction (arrondi)
 * @example calculateDiscountPercentage(100, 80) => 20
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice === 0) return 0;
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * Appliquer une réduction en pourcentage
 * @param price Prix original
 * @param percentage Pourcentage de réduction (ex: 20 pour 20%)
 * @returns Prix après réduction
 * @example applyPercentageDiscount(100, 20) => 80
 */
export function applyPercentageDiscount(price: number, percentage: number): number {
  const discount = (price * percentage) / 100;
  return price - discount;
}

/**
 * Appliquer une réduction fixe
 * @param price Prix original
 * @param discount Montant de la réduction
 * @returns Prix après réduction (minimum 0)
 * @example applyFixedDiscount(50, 10) => 40
 */
export function applyFixedDiscount(price: number, discount: number): number {
  return Math.max(0, price - discount);
}

/**
 * Formater une remise
 * @param discountType Type de remise ('percentage' ou 'fixed')
 * @param discountValue Valeur de la remise
 * @returns String formaté
 * @example formatDiscount('percentage', 20) => '-20%'
 * @example formatDiscount('fixed', 10) => '-10,00 €'
 */
export function formatDiscount(
  discountType: 'percentage' | 'fixed',
  discountValue: number
): string {
  if (discountType === 'percentage') {
    return `-${discountValue}%`;
  }
  return `-${formatPrice(discountValue)}`;
}

/**
 * Calculer le total avec TVA
 * @param priceHT Prix HT
 * @param tvaRate Taux de TVA (ex: 20 pour 20%)
 * @returns Objet avec détails TVA
 * @example calculateTVA(100, 20) => { priceHT: 100, tva: 20, priceTTC: 120 }
 */
export function calculateTVA(
  priceHT: number,
  tvaRate: number
): {
  priceHT: number;
  tva: number;
  priceTTC: number;
} {
  const tva = (priceHT * tvaRate) / 100;
  const priceTTC = priceHT + tva;

  return {
    priceHT: Math.round(priceHT * 100) / 100,
    tva: Math.round(tva * 100) / 100,
    priceTTC: Math.round(priceTTC * 100) / 100,
  };
}

/**
 * Arrondir au centime supérieur
 * @param price Prix
 * @returns Prix arrondi
 * @example roundUpToCent(12.345) => 12.35
 */
export function roundUpToCent(price: number): number {
  return Math.ceil(price * 100) / 100;
}

/**
 * Arrondir au centime inférieur
 * @param price Prix
 * @returns Prix arrondi
 * @example roundDownToCent(12.345) => 12.34
 */
export function roundDownToCent(price: number): number {
  return Math.floor(price * 100) / 100;
}

/**
 * Formater un intervalle de prix
 * @param minPrice Prix minimum
 * @param maxPrice Prix maximum
 * @returns String formaté
 * @example formatPriceRange(20, 50) => 'de 20,00 € à 50,00 €'
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  return `de ${formatPrice(minPrice)} à ${formatPrice(maxPrice)}`;
}

/**
 * Vérifier si un prix est valide
 * @param price Prix à vérifier
 * @returns true si le prix est valide (nombre positif)
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}
