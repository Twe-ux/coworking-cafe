import { useMemo } from "react";
import type { CashEntryRow } from "@/types/accounting";

export interface CashEntryTotals {
  TTC: number;
  HT: number;
  TVA: number;
  prestaB2B: number;
  depenses: number;
  cbClassique: number;
  cbSansContact: number;
  virement: number;
  especes: number;
  difference: number;
}

/**
 * Hook pour calculer les totaux de toutes les entrées de caisse
 * Gère le calcul en centimes pour éviter les erreurs d'arrondi
 */
export function useCashEntryTotals(data: CashEntryRow[]): CashEntryTotals {
  return useMemo(() => {
    return data.reduce(
      (acc, row) => {
        acc.TTC += Number(row.TTC) || 0;
        acc.HT += Number(row.HT) || 0;
        acc.TVA += Number(row.TVA) || 0;

        // Calcul presta B2B
        if (Array.isArray(row.prestaB2B)) {
          acc.prestaB2B += row.prestaB2B.reduce(
            (s, p) => s + (Number(p.value) || 0),
            0
          );
        } else {
          acc.prestaB2B += Number(row.prestaB2B) || 0;
        }

        // Calcul dépenses
        if (Array.isArray(row.depenses)) {
          acc.depenses += row.depenses.reduce(
            (s, d) => s + (Number(d.value) || 0),
            0
          );
        } else {
          acc.depenses += Number(row.depenses) || 0;
        }

        // Encaissements
        acc.virement += Number(row.virement) || 0;
        acc.cbClassique += Number(row.cbClassique) || 0;
        acc.cbSansContact += Number(row.cbSansContact) || 0;
        acc.especes += Number(row.especes) || 0;

        // Calcul de la différence en centimes
        const ttc = Number(acc.TTC) * 100 || 0;
        const totalSaisie =
          (Number(acc.depenses) * 100 || 0) +
          (Number(acc.virement) * 100 || 0) +
          (Number(acc.cbClassique) * 100 || 0) +
          (Number(acc.cbSansContact) * 100 || 0) +
          (Number(acc.especes) * 100 || 0) -
          (Number(acc.prestaB2B) * 100 || 0);

        const difference = Math.round(totalSaisie) - Math.round(ttc);
        acc.difference = difference / 100 || 0;

        return acc;
      },
      {
        TTC: 0,
        HT: 0,
        TVA: 0,
        prestaB2B: 0,
        depenses: 0,
        cbClassique: 0,
        cbSansContact: 0,
        virement: 0,
        especes: 0,
        difference: 0,
      }
    );
  }, [data]);
}
