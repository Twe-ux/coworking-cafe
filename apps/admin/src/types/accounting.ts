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

// ============================================================================
// B2B Revenue (Factures manuelles B2B)
// ============================================================================

export interface B2BRevenue {
  _id: string                     // YYYY/MM/DD (comme turnovers)
  date: string                    // YYYY-MM-DD
  ht: number                      // Montant HT
  ttc: number                     // Montant TTC
  tva: number                     // Montant TVA (calculé: TTC - HT)
  notes?: string                  // Notes optionnelles
  createdAt?: Date
  updatedAt?: Date
}

export interface B2BRevenueFormData {
  _id: string
  date: string
  ht: string
  ttc: string
  tva: string
  notes: string
}

export interface B2BRevenueRow extends B2BRevenue {
  [key: string]: unknown
}

// ============================================================================
// Consolidated Revenue (Vue consolidée Turnovers + B2B)
// ============================================================================

export interface ConsolidatedDailyRevenue {
  date: string
  // Turnovers (caisse)
  turnovers: {
    ht: number
    ttc: number
    tva: number
  }
  // B2B
  b2b: {
    ht: number
    ttc: number
    tva: number
  }
  // Total
  total: {
    ht: number
    ttc: number
    tva: number
  }
}

export interface ConsolidatedMonthlyStats {
  month: string                   // YYYY-MM
  turnovers: {
    ht: number
    ttc: number
    tva: number
  }
  b2b: {
    ht: number
    ttc: number
    tva: number
  }
  total: {
    ht: number
    ttc: number
    tva: number
  }
}
