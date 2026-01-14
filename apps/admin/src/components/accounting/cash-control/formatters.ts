/**
 * Formatting utilities for cash control columns
 */

export const AmountFormatter = new Intl.NumberFormat("fr", {
  style: "currency",
  currency: "EUR",
})

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return ""
  return AmountFormatter.format(amount)
}

export function isEmptyAmount(amount: number | null | undefined): boolean {
  return amount === null || amount === undefined || amount === 0
}
