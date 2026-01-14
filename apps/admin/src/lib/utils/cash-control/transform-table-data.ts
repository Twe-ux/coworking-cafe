import type { CashEntryRow } from "@/types/accounting";
import type { MergedCashData } from "./merge-cash-data";

/**
 * Calcule le total d'un tableau de valeurs {label, value}
 */
function calculateTotal(items: Array<{ label: string; value: number }> | undefined): number {
  return items?.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 0;
}

/**
 * Transforme les données mergées en lignes pour le tableau
 * Calcule tous les totaux nécessaires (B2B, dépenses, CA, encaissements)
 */
export function transformToTableData(mergedData: MergedCashData[]): CashEntryRow[] {
  return mergedData.map((entry) => {
    const totalB2B = calculateTotal(entry.prestaB2B);
    const totalDepenses = calculateTotal(entry.depenses);
    const totalCA = totalB2B - totalDepenses;
    const totalEncaissements =
      (entry.especes || 0) +
      (entry.virement || 0) +
      (entry.cbClassique || 0) +
      (entry.cbSansContact || 0);

    return {
      _id: entry._id,
      date: entry.date,
      TTC: entry.TTC || 0,
      HT: entry.HT || 0,
      TVA: entry.TVA || 0,
      totalCA,
      totalEncaissements,
      totalB2B,
      totalDepenses,
      especes: entry.especes || 0,
      virement: entry.virement || 0,
      cbClassique: entry.cbClassique || 0,
      cbSansContact: entry.cbSansContact || 0,
      prestaB2B: entry.prestaB2B,
      depenses: entry.depenses,
    };
  });
}
