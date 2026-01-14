import type { CashEntryRow } from "@/types/accounting";

/**
 * Formate une date en format DD-MM-YYYY
 */
export function formatDateDDMMYYYY(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

/**
 * Calcule le total des dépenses en centimes
 */
export function calculateTotalDepenses(
  depenses: CashEntryRow["depenses"]
): number {
  if (Array.isArray(depenses)) {
    return depenses.reduce(
      (acc, d) => acc + (Number(d.value) * 100 || 0),
      0
    );
  } else if (!isNaN(Number(depenses))) {
    return Number(depenses) * 100 || 0;
  }
  return 0;
}

/**
 * Calcule le total des prestations B2B en centimes
 */
export function calculateTotalPrestaB2B(
  prestaB2B: CashEntryRow["prestaB2B"]
): number {
  if (Array.isArray(prestaB2B)) {
    return prestaB2B.reduce(
      (acc, p) => acc + (Number(p.value) * 100 || 0),
      0
    );
  } else if (!isNaN(Number(prestaB2B))) {
    return Number(prestaB2B) * 100 || 0;
  }
  return 0;
}

/**
 * Calcule la couleur de fond d'une ligne selon la différence TTC/Saisie
 */
export function calculateRowBackground(
  ttcInCents: number,
  totalSaisieInCents: number
): string | undefined {
  const ttc = Math.round(ttcInCents);
  const saisie = Math.round(totalSaisieInCents);

  if (ttc === saisie && ttc !== 0) {
    return "#d1fae5"; // vert clair - correspondance parfaite
  } else if (ttc !== 0 && saisie !== 0) {
    return "#fee2e2"; // rouge clair - différence
  }
  return undefined; // pas de couleur si l'un des deux est 0
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
