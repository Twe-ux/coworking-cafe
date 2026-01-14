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
  TVA?: number
  [key: string]: unknown
}

export interface CashEntryRow {
  _id: string
  date: string
  TTC?: number
  HT?: number
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
