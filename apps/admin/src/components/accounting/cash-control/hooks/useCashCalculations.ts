import { useEffect, useState } from "react";
import type { CashEntryFormData, CashEntryRow } from "@/types/accounting";

interface UseCashCalculationsProps {
  form: CashEntryFormData;
  editingRow: CashEntryRow | null;
  setForm: React.Dispatch<React.SetStateAction<CashEntryFormData>>;
}

interface UseCashCalculationsReturn {
  isManuallyEdited: boolean;
  setIsManuallyEdited: (value: boolean) => void;
  calculateEspeces: () => number;
}

/**
 * Hook personnalisé pour gérer les calculs automatiques des espèces
 * dans le formulaire de contrôle de caisse
 */
export function useCashCalculations({
  form,
  editingRow,
  setForm,
}: UseCashCalculationsProps): UseCashCalculationsReturn {
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  // Fonction utilitaire pour arrondir les montants monétaires
  const roundToDecimals = (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Fonction pour calculer automatiquement les espèces
  const calculateEspeces = (): number => {
    // Récupérer le TTC depuis editingRow avec arrondi
    const ttc = roundToDecimals(Number(editingRow?.TTC) || 0, 2);

    // Calculer le total des prestations B2B avec arrondi
    const totalPrestaB2B = roundToDecimals(
      form.prestaB2B.reduce((sum, presta) => {
        return sum + (Number(presta.value) || 0);
      }, 0),
      2
    );

    // Calculer le total des dépenses avec arrondi
    const totalDepenses = roundToDecimals(
      form.depenses.reduce((sum, depense) => {
        return sum + (Number(depense.value) || 0);
      }, 0),
      2
    );

    // Arrondir chaque montant de paiement
    const cbClassique = roundToDecimals(Number(form.cbClassique) || 0, 2);
    const cbSansContact = roundToDecimals(Number(form.cbSansContact) || 0, 2);
    const virement = roundToDecimals(Number(form.virement) || 0, 2);

    // Calculer les espèces selon la formule : TTC + prestaB2B - depenses - cbClassique - cbSansContact - virement
    const calculatedEspeces =
      ttc +
      totalPrestaB2B -
      totalDepenses -
      cbClassique -
      cbSansContact -
      virement;

    // Arrondir le résultat final et ne pas permettre de valeurs négatives
    const roundedEspeces = roundToDecimals(calculatedEspeces, 2);
    return Math.max(0, roundedEspeces);
  };

  // Mettre à jour automatiquement les espèces quand les autres champs changent
  useEffect(() => {
    // Ne pas écraser si l'utilisateur a modifié manuellement
    if (isManuallyEdited) return;

    const newEspeces = calculateEspeces();
    const currentEspeces = Number(form.especes) || 0;

    // Comparer avec une tolérance pour éviter les problèmes de précision des flottants
    if (Math.abs(currentEspeces - newEspeces) > 0.01) {
      const formattedEspeces = newEspeces.toFixed(2);
      setForm((f) => ({ ...f, especes: formattedEspeces }));
    }
  }, [
    form.prestaB2B,
    form.depenses,
    form.cbClassique,
    form.cbSansContact,
    form.virement,
    editingRow?.TTC,
    isManuallyEdited,
  ]);

  // Réinitialiser le flag de modification manuelle quand on change de ligne
  useEffect(() => {
    setIsManuallyEdited(false);
  }, [editingRow?._id]);

  return {
    isManuallyEdited,
    setIsManuallyEdited,
    calculateEspeces,
  };
}
