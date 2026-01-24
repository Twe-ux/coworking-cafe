/**
 * Constants for ContractGenerationModal
 * Company info, days configuration, and styles
 */

import type { ContractDay, CompanyInfo, TableCellStyle, DayKey } from "./types";

// Days of the week for contract tables
export const DAYS: readonly ContractDay[] = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
] as const;

// Week labels for distribution table
export const WEEKS = [
  "Semaine 1",
  "Semaine 2",
  "Semaine 3",
  "Semaine 4",
] as const;
export const WEEK_KEYS = ["week1", "week2", "week3", "week4"] as const;
export type WeekKey = (typeof WEEK_KEYS)[number];

// Company information - ILY SARL
export const COMPANY_INFO: CompanyInfo = {
  name: "ILY SARL",
  legalForm: "SARL",
  address: {
    street: "1 RUE DE LA DIVISION LECLERC",
    postalCode: "67000",
    city: "STRASBOURG",
  },
  representative: {
    name: "MILONE Thierry",
    role: "Gérant",
  },
  nafCode: "5630 Z",
  urssaf: {
    name: "D'ALSACE (427)",
    number: "n 829 552 264 000 22",
  },
};

// Average weeks per month for calculation
export const WEEKS_PER_MONTH = 4.33;

// Full-time hours threshold
export const FULL_TIME_HOURS = 35;

// Contract content styles
export const CONTRACT_STYLES = {
  container: {
    padding: "60px 200px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    minHeight: "800px",
    fontFamily: "Arial, sans-serif",
    fontSize: "11pt",
    lineHeight: "1.6",
  },
  title: {
    fontSize: "13pt",
    fontWeight: "bold" as const,
    marginBottom: "8px",
    textTransform: "uppercase" as const,
  },
  subtitle: {
    fontSize: "10pt",
    fontStyle: "italic" as const,
    margin: 0,
  },
  sectionTitle: {
    fontSize: "11pt",
    fontWeight: "bold" as const,
    marginBottom: "15px",
  },
  articleTitle: {
    fontSize: "11pt",
    fontWeight: "bold" as const,
    marginBottom: "12px",
    textDecoration: "underline" as const,
  },
  section: {
    marginBottom: "30px",
    pageBreakInside: "avoid" as const,
  },
} as const;

// Table styles
export const TABLE_STYLES = {
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    border: "1px solid #000",
    fontSize: "9pt",
  },
  headerRow: {
    backgroundColor: "#e9ecef",
  },
  headerCell: {
    border: "1px solid #000",
    padding: "6px",
    textAlign: "center" as const,
    fontWeight: "bold" as const,
  } as TableCellStyle,
  cell: {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center" as const,
  } as TableCellStyle,
  labelCell: {
    border: "1px solid #000",
    padding: "8px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
  } as TableCellStyle,
  unavailableRow: {
    backgroundColor: "#f8f9fa",
  },
  footerRow: {
    backgroundColor: "#e9ecef",
    fontWeight: "bold" as const,
  },
} as const;

// Helper to check if a day key is valid
export function isDayKey(key: string): key is DayKey {
  return DAYS.some((day) => day.key === key);
}
