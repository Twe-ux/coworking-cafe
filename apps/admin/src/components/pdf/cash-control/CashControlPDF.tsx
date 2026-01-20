'use client'

import { Document } from '@react-pdf/renderer'
import { SummaryPage } from './SummaryPage'
import { DailyTurnoverPage } from './DailyTurnoverPage'
import { B2BExpensesPage } from './B2BExpensesPage'
import { PaymentMethodsPage } from './PaymentMethodsPage'
import type { CashControlPDFProps } from './types'

/**
 * CashControlPDF - Monthly cash control report
 *
 * Generates a 5-page PDF document:
 * - Page 1: Summary (turnover, B2B/expenses, payment methods)
 * - Pages 2-3: Daily turnover with VAT details (split for large months)
 * - Page 4: Daily B2B invoices and expenses
 * - Page 5: Daily payment methods breakdown
 *
 * Refactored from 697 lines to ~50 lines using page components
 */
export function CashControlPDF({
  data,
  selectedMonth,
  selectedYear,
}: CashControlPDFProps) {
  return (
    <Document pageMode="fullScreen">
      {/* Page 1: Summary */}
      <SummaryPage
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Page 2: Daily Turnover (first 15 days) */}
      <DailyTurnoverPage
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        pageNumber={2}
        isFirstHalf={true}
      />

      {/* Page 3: Daily Turnover (remaining days) */}
      <DailyTurnoverPage
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        pageNumber={3}
        isFirstHalf={false}
      />

      {/* Page 4: B2B Invoices & Expenses */}
      <B2BExpensesPage
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Page 5: Payment Methods */}
      <PaymentMethodsPage
        data={data}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </Document>
  )
}
