/**
 * CashControlPDF - Re-export for backward compatibility
 *
 * This component has been refactored into a modular structure.
 * See: /components/pdf/cash-control/
 *
 * Structure:
 * - CashControlPDF.tsx (main component, ~50 lines)
 * - types.ts (interfaces and constants)
 * - styles.ts (PDF StyleSheet)
 * - utils.ts (formatting utilities)
 * - calculations.ts (data calculation functions)
 * - PDFHeader.tsx (reusable page header)
 * - PDFFooter.tsx (reusable page footer)
 * - SummaryPage.tsx (page 1)
 * - DailyTurnoverPage.tsx (pages 2-3)
 * - B2BExpensesPage.tsx (page 4)
 * - PaymentMethodsPage.tsx (page 5)
 */

// Re-export for backward compatibility
export { CashControlPDF } from './cash-control'
export type { TurnoverData, CashControlPDFProps } from './cash-control'
