// ============================================================================
// CASH REGISTER TYPES - CoworKing Café
// ============================================================================
// Typed interfaces for the cash register tracking module
// Created: 2026-02-05
// ============================================================================

/**
 * Cash Denomination
 * Représente une dénomination de billet ou pièce
 */
export interface CashDenomination {
  value: number;
  quantity: number;
}

/**
 * Cash Count Details
 * Détail du comptage (billets et pièces)
 */
export interface CashCountDetails {
  bills: CashDenomination[];
  coins: CashDenomination[];
}

/**
 * Counted By
 * Informations sur l'employé qui a compté
 */
export interface CountedBy {
  userId: string;
  name: string;
}

/**
 * Cash Register Entry
 * Entrée de fond de caisse
 */
export interface CashRegisterEntry {
  _id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  countedBy: CountedBy;
  countDetails?: CashCountDetails;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Cash Register Payload
 * Données pour créer une nouvelle saisie
 */
export interface CreateCashRegisterPayload {
  date: string; // YYYY-MM-DD
  amount: number;
  countedBy: CountedBy;
  countDetails?: CashCountDetails;
  notes?: string;
}

/**
 * Cash Register Response
 * Réponse de l'API pour les opérations sur le fond de caisse
 */
export interface CashRegisterResponse {
  success: boolean;
  data?: CashRegisterEntry;
  error?: string;
}

/**
 * Cash Register List Response
 * Réponse de l'API pour la liste des saisies
 */
export interface CashRegisterListResponse {
  success: boolean;
  data?: {
    entries: CashRegisterEntry[];
    total: number;
  };
  error?: string;
}

/**
 * Cash Register Monthly Summary
 * Résumé mensuel du fond de caisse
 */
export interface CashRegisterMonthlySummary {
  month: string; // YYYY-MM
  entries: CashRegisterEntry[];
  totalAmount: number;
  averageAmount: number;
}

/**
 * Employee Info
 * Informations d'un employé pour la sélection
 */
export interface EmployeeInfo {
  id: string;
  firstName: string;
  lastName?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Euro Bills Denominations
 * Valeurs des billets en euros
 */
export const EURO_BILLS = [500, 200, 100, 50, 20, 10, 5] as const;

/**
 * Euro Coins Denominations
 * Valeurs des pièces en euros
 */
export const EURO_COINS = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01] as const;

/**
 * Type for Euro Bill Values
 */
export type EuroBillValue = typeof EURO_BILLS[number];

/**
 * Type for Euro Coin Values
 */
export type EuroCoinValue = typeof EURO_COINS[number];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate total from count details
 */
export function calculateTotalFromDetails(details: CashCountDetails): number {
  const billsTotal = details.bills.reduce(
    (sum, item) => sum + item.value * item.quantity,
    0
  );
  const coinsTotal = details.coins.reduce(
    (sum, item) => sum + item.value * item.quantity,
    0
  );
  return billsTotal + coinsTotal;
}

/**
 * Format amount as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Get empty count details structure
 */
export function getEmptyCountDetails(): CashCountDetails {
  return {
    bills: EURO_BILLS.map(value => ({ value, quantity: 0 })),
    coins: EURO_COINS.map(value => ({ value, quantity: 0 }))
  };
}
