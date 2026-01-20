/**
 * Calculation functions for CashControlPDF
 */

import type { TurnoverData } from './types'

/**
 * Calculate sum of VAT amounts at a specific rate
 */
export function sumByVatRate(
  data: TurnoverData[],
  category: 'ca-ht' | 'ca-tva' | 'ca-ttc',
  rate: '5.5' | '10' | '20'
): number {
  return data.reduce((sum, row) => sum + Number(row[category]?.[rate] || 0), 0)
}

/**
 * Calculate total across all VAT rates for a category
 */
export function sumAllVatRates(
  data: TurnoverData[],
  category: 'ca-ht' | 'ca-tva' | 'ca-ttc'
): number {
  return data.reduce(
    (sum, row) =>
      sum +
      Number(
        (row[category]?.['5.5'] || 0) +
        (row[category]?.['10'] || 0) +
        (row[category]?.['20'] || 0)
      ),
    0
  )
}

/**
 * Calculate total B2B invoices
 */
export function sumB2BInvoices(data: TurnoverData[]): number {
  return data.reduce((acc, row) => {
    if (Array.isArray(row.prestaB2B)) {
      return acc + row.prestaB2B.reduce((s, p) => s + (Number(p.value) || 0), 0)
    }
    return acc
  }, 0)
}

/**
 * Calculate total expenses
 */
export function sumExpenses(data: TurnoverData[]): number {
  return data.reduce((acc, row) => {
    if (Array.isArray(row.depenses)) {
      return acc + row.depenses.reduce((s, p) => s + (Number(p.value) || 0), 0)
    }
    return acc
  }, 0)
}

/**
 * Calculate sum of a payment method
 */
export function sumPaymentMethod(
  data: TurnoverData[],
  method: 'cbClassique' | 'cbSansContact' | 'virement' | 'especes'
): number {
  return data.reduce((acc, row) => acc + (Number(row[method]) || 0), 0)
}
