export interface PrestaB2BItem {
  label: string
  value: number
}

export interface DepenseItem {
  label: string
  value: number
}

export interface CashEntry {
  _id: string
  date: string
  prestaB2B: PrestaB2BItem[]
  depenses?: DepenseItem[]
  especes?: number
  virement?: number
  cbClassique?: number
  cbSansContact?: number
  [key: string]: unknown
}

export interface CashEntryFormData {
  _id: string
  date: string
  prestaB2B: { label: string; value: string }[]
  depenses: { label: string; value: string }[]
  virement: string
  especes: string
  cbClassique: string
  cbSansContact: string
}

export interface VATData {
  "total-ht": number
  "total-ttc": number
  "total-taxes": number
}

export interface Turnover {
  _id: string
  "vat-20": VATData
  "vat-10": VATData
  "vat-55": VATData
  "vat-0": VATData
}

export interface TurnoverData {
  date: string
  HT: number
  TTC: number
  TVA?: number
  'ca-ht'?: { [key: string]: number }
  'ca-ttc'?: { [key: string]: number }
  'ca-tva'?: { [key: string]: number }
  [key: string]: unknown
}

export interface CashEntryRow {
  _id: string
  date: string
  TTC: number
  HT: number
  TVA?: number
  totalCA: number
  totalEncaissements: number
  totalB2B: number
  totalDepenses: number
  especes: number
  virement: number
  cbClassique: number
  cbSansContact: number
  prestaB2B?: PrestaB2BItem[]
  depenses?: DepenseItem[]
  [key: string]: unknown
}

/**
 * Empreinte bancaire capturée (no-show ou annulation client)
 */
export interface CapturedDeposit {
  _id: string
  userName: string
  userEmail: string
  companyName?: string
  bookingDate: string
  cancelledAt: string
  depositAmount: number
  cancelReason: string
  spaceType: string
}

/**
 * B2B Revenue Document (from database)
 */
export interface B2BRevenueDocument {
  _id: string
  serviceDate: string     // Date de prestation (YYYY-MM-DD) - vide si répartition mensuelle
  invoiceDate: string     // Date de facturation (YYYY-MM-DD)
  client: string          // Nom du client
  revenueHT_5_5?: number  // CA HT TVA 5.5%
  revenueHT_10?: number   // CA HT TVA 10%
  revenueHT_20?: number   // CA HT TVA 20%
  revenueHT: number       // CA HT Total
  isMonthlyDistribution?: boolean  // true si répartition mensuelle
  distributionMonth?: string       // Format "YYYY-MM" pour répartition mensuelle
  createdBy: {
    userId: string
    name: string
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * Analytics Revenue Data
 */
export interface AnalyticsRevenueData {
  ht: number
  ttc?: number
  tva?: number
}

/**
 * Analytics Period Information
 */
export interface AnalyticsPeriod {
  type: string
  startDate: string
  endDate: string
  label: string
}

/**
 * Analytics Variation Data
 */
export interface AnalyticsVariation {
  amount: number
  percentage: number
  trend: "up" | "down" | "stable"
}

/**
 * Analytics Comparison Data
 */
export interface AnalyticsComparison {
  period: AnalyticsPeriod
  b2c: AnalyticsRevenueData
  b2b: AnalyticsRevenueData
  total: AnalyticsRevenueData
  variation: {
    b2c: AnalyticsVariation
    b2b: AnalyticsVariation
    total: AnalyticsVariation
  }
}

/**
 * Analytics Breakdown Item
 */
export interface AnalyticsBreakdownItem {
  category: string
  label: string
  ht: number
  ttc: number
  percentage: number
  color: string
}

/**
 * Chart Data Point (for time series)
 */
export interface ChartDataPoint {
  displayDate: string
  current: {
    ht: number
    ttc: number
  }
  comparison?: {
    ht: number
    ttc: number
  }
}

/**
 * Revenue Breakdown for Pie/Bar Charts
 */
export interface RevenueBreakdown {
  bookings: number
  products: number
  services: number
  b2b: number
}

/**
 * Revenue Data (current period)
 */
export interface RevenueData {
  b2c: {
    ht: number
    ttc: number
  }
  b2b: {
    ht: number
    ttc: number
  }
  total: {
    ht: number
    ttc: number
  }
}

/**
 * Comparison Data (previous period)
 */
export interface ComparisonData {
  b2c: {
    ht: number
    ttc: number
  }
  b2b: {
    ht: number
    ttc: number
  }
  total: {
    ht: number
    ttc: number
  }
}

/**
 * Analytics API Response
 */
export interface AnalyticsResponse {
  current: RevenueData
  comparison?: ComparisonData
  chartData: ChartDataPoint[]
  breakdown: RevenueBreakdown
}

/**
 * Create B2B Revenue Input
 */
export interface CreateB2BRevenueInput {
  serviceDate: string
  invoiceDate: string
  client: string
  revenueHT_5_5?: number
  revenueHT_10?: number
  revenueHT_20?: number
  revenueHT: number
}

/**
 * B2B Revenue (simplified for frontend)
 */
export interface B2BRevenue {
  id: string
  serviceDate: string
  invoiceDate: string
  client: string
  revenueHT_5_5?: number
  revenueHT_10?: number
  revenueHT_20?: number
  revenueHT: number
  createdAt: string
}

/**
 * Comparison Row (for yearly, monthly, weekly comparisons)
 */
export interface ComparisonRow {
  period: string
  label?: string
  date?: string
  current: number
  previous: number
  evolution: {
    amount: number
    percentage: number
    trend: "up" | "down" | "stable"
  }
}

/**
 * Year-over-Year Comparison Data with Summary
 */
export interface YearlyComparisonData {
  rows: ComparisonRow[]
  summary: {
    total: ComparisonRow
    average: number
    best: ComparisonRow
    worst: ComparisonRow
  }
}
