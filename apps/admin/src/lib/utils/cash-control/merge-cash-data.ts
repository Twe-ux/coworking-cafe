import type { CashEntry } from "@/types/accounting";

export interface TurnoverItem {
  date: string;
  TTC?: number;
  HT?: number;
  TVA?: number;
  'ca-ht'?: { [key: string]: number };
  'ca-tva'?: { [key: string]: number };
  'ca-ttc'?: { [key: string]: number };
}

export interface MergedCashData {
  _id: string;
  date: string;
  TTC?: number;
  HT?: number;
  TVA?: number;
  'ca-ht'?: { [key: string]: number };
  'ca-tva'?: { [key: string]: number };
  'ca-ttc'?: { [key: string]: number };
  prestaB2B: Array<{ label: string; value: number }>;
  depenses: Array<{ label: string; value: number }>;
  virement: number | null;
  especes: number | null;
  cbClassique: number | null;
  cbSansContact: number | null;
  source: "turnover" | "cashEntry";
}

/**
 * Fusionne les données de turnover et cashEntry pour avoir toutes les dates
 * Filtre par année et mois sélectionnés
 */
export function mergeCashData(
  turnoverData: TurnoverItem[] | undefined,
  cashEntries: CashEntry[] | undefined,
  selectedYear: number,
  selectedMonth: number
): MergedCashData[] {
  if (!turnoverData && !cashEntries) return [];

  const allDatesMap = new Map<string, MergedCashData>();

  // Ajouter toutes les dates de turnover
  turnoverData?.forEach((turnoverItem) => {
    allDatesMap.set(turnoverItem.date, {
      _id: turnoverItem.date,
      date: turnoverItem.date,
      TTC: turnoverItem.TTC,
      HT: turnoverItem.HT,
      TVA: turnoverItem.TVA ?? 0,
      'ca-ht': turnoverItem['ca-ht'],
      'ca-tva': turnoverItem['ca-tva'],
      'ca-ttc': turnoverItem['ca-ttc'],
      prestaB2B: [],
      depenses: [],
      virement: null,
      especes: null,
      cbClassique: null,
      cbSansContact: null,
      source: "turnover",
    });
  });

  // Ajouter toutes les dates de cashEntry qui correspondent aux filtres
  cashEntries?.forEach((entry: CashEntry) => {
    const entryDate = entry._id;

    // Vérifier si cette date correspond aux filtres actuels
    if (entryDate) {
      const d = new Date(entryDate.replace(/\//g, "-"));
      const yearMatch = d.getFullYear() === selectedYear;
      const monthMatch = d.getMonth() === selectedMonth;

      if (yearMatch && monthMatch) {
        const existing = allDatesMap.get(entryDate);
        if (existing) {
          // Fusionner avec données turnover existantes
          allDatesMap.set(entryDate, {
            ...existing,
            prestaB2B: entry.prestaB2B || [],
            depenses: entry.depenses || [],
            virement: entry.virement ?? null,
            especes: entry.especes ?? null,
            cbClassique: entry.cbClassique ?? null,
            cbSansContact: entry.cbSansContact ?? null,
          });
        } else {
          // Créer nouvelle entrée (date sans turnover)
          allDatesMap.set(entryDate, {
            _id: entryDate,
            date: entryDate,
            TTC: 0,
            HT: 0,
            TVA: 0,
            prestaB2B: entry.prestaB2B || [],
            depenses: entry.depenses || [],
            virement: entry.virement ?? null,
            especes: entry.especes ?? null,
            cbClassique: entry.cbClassique ?? null,
            cbSansContact: entry.cbSansContact ?? null,
            source: "cashEntry",
          });
        }
      }
    }
  });

  // Convertir le Map en tableau et trier par date
  return Array.from(allDatesMap.values()).sort(
    (a, b) =>
      new Date(a.date.replace(/\//g, "-")).getTime() -
      new Date(b.date.replace(/\//g, "-")).getTime()
  );
}
