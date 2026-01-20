/**
 * Utility functions for CashControlPDF
 */

import { VAT_RATES, VAT_RATE_LABELS } from './types'

const MONTHS = [
  'JANVIER',
  'FEVRIER',
  'MARS',
  'AVRIL',
  'MAI',
  'JUIN',
  'JUILLET',
  'AOUT',
  'SEPTEMBRE',
  'OCTOBRE',
  'NOVEMBRE',
  'DECEMBRE',
]

/**
 * Get French month name from index
 */
export function getMonthName(month: number | null): string {
  return month !== null && month >= 0 && month < 12 ? MONTHS[month] : ''
}

/**
 * Format date string to DD/MM/YY
 */
export function formatDateDDMMYY(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const year = String(d.getFullYear()).slice(-2)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${day}/${month}/${year}`
}

/**
 * Format currency, return empty string if zero/null
 */
export function formatCurrencyOrEmpty(value: number): string {
  if (!value || value === 0) return ''
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

/**
 * Format currency, return space if zero/null
 */
export function formatCurrencyOrSpace(value: number): string {
  if (!value || value === 0) return ' '
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  })
}

/**
 * Format TVA details by rate
 */
export function formatTVADetails(
  data: Record<string, number> | undefined,
  prefix: string
): string {
  if (!data) return ' '

  const lines = VAT_RATES.map((rate, idx) => {
    const value = data?.[rate]
    if (!value || value === 0) return `${prefix} ${VAT_RATE_LABELS[idx]}% : 0,00`
    return `${prefix} ${VAT_RATE_LABELS[idx]}% : ${formatCurrencyOrSpace(value)}`
  })

  return lines.join('\n')
}

/**
 * Format B2B details list
 */
export function formatB2BDetails(
  data: { label: string; value: number }[] | undefined
): string {
  if (!data || !Array.isArray(data) || data.length === 0) return ' '

  const lines = data.map((item) => {
    if (!item.value || item.value === 0) return ' '
    return `${item.label || 'Sans libelle'}: ${formatCurrencyOrEmpty(item.value)}`
  })

  const nonEmptyLines = lines.filter((line) => line.trim() !== '')
  if (nonEmptyLines.length === 0) return ' '

  while (nonEmptyLines.length < 3) {
    nonEmptyLines.push(' ')
  }

  return nonEmptyLines.join('\n')
}

/**
 * Format expenses details list
 */
export function formatDepensesDetails(
  data: { label: string; value: number }[] | undefined
): string {
  if (!data || !Array.isArray(data) || data.length === 0) return ' '

  const lines = data.map((item) => {
    if (!item.value || item.value === 0) return ' '
    return `${item.label || 'Sans libelle'}: ${formatCurrencyOrEmpty(item.value)}`
  })

  const nonEmptyLines = lines.filter((line) => line.trim() !== '')
  if (nonEmptyLines.length === 0) return ' '

  while (nonEmptyLines.length < 3) {
    nonEmptyLines.push(' ')
  }

  return nonEmptyLines.join('\n')
}
