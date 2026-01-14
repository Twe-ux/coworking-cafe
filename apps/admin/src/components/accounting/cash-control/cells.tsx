/**
 * Reusable cell components for cash control table
 */

import { AmountFormatter } from "./formatters"

interface DataItem {
  label: string
  value: number
}

interface DataListCellProps {
  data: DataItem[] | null | undefined
}

export function DataListCell({ data }: DataListCellProps) {
  if (!Array.isArray(data) || data.length === 0) return null

  const validData = data.filter(
    (d) => d.label && d.value !== undefined && d.value !== null
  )

  if (validData.length === 0) return null

  return (
    <div className="flex flex-col items-end gap-0.5">
      {validData.map((d, idx) => (
        <div className="flex min-w-24 gap-1" key={idx}>
          <span className="min-w-[50px] text-right font-bold">{d.label} :</span>
          <span className="min-w-[60px] text-right font-medium">
            {AmountFormatter.format(d.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

interface AmountCellProps {
  amount: number | null | undefined
  className?: string
}

export function AmountCell({ amount, className = "" }: AmountCellProps) {
  if (amount === null || amount === undefined || amount === 0) return null

  return (
    <div className={`text-center ${className}`}>
      {AmountFormatter.format(amount)}
    </div>
  )
}

interface DifferenceCellProps {
  ca: number
  encaissements: number
}

export function DifferenceCell({ ca, encaissements }: DifferenceCellProps) {
  const difference = encaissements - ca

  if (Math.abs(difference) < 0.01) return null

  const colorClass = difference < 0 ? "text-red-600" : "text-green-600"

  return (
    <div className={`text-center font-bold ${colorClass}`}>
      {AmountFormatter.format(difference)}
    </div>
  )
}
