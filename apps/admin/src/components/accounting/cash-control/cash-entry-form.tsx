import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import type { CashEntryFormData, CashEntryRow } from "@/types/accounting";

// Types locaux pour les items du formulaire (string values)
type DepenseFormItem = { label: string; value: string }
type PrestaFormItem = { label: string; value: string }

interface FormCashControlProps {
  form: CashEntryFormData;
  setForm: React.Dispatch<React.SetStateAction<CashEntryFormData>>;
  formStatus: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editingRow: CashEntryRow | null;
}

export function FormCashControl({
  form,
  setForm,
  formStatus,
  editingRow,
  onSubmit,
}: FormCashControlProps) {
  // État pour savoir si l'utilisateur a modifié manuellement les espèces
  const [isManuallyEdited, setIsManuallyEdited] = React.useState(false);

  // Fonction utilitaire pour arrondir les montants monétaires
  const roundToDecimals = (value: number, decimals: number = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Fonction pour calculer automatiquement les espèces
  const calculateEspeces = () => {
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

  // Mettre à jour automatiquement les espèces quand les autres champs changent (seulement si pas modifié manuellement)
  useEffect(() => {
    // Ne pas écraser si l'utilisateur a modifié manuellement
    if (isManuallyEdited) return;

    const newEspeces = calculateEspeces();
    const currentEspeces = Number(form.especes) || 0;

    // Comparer avec une tolérance pour éviter les problèmes de précision des flottants
    if (Math.abs(currentEspeces - newEspeces) > 0.01) {
      // Formater avec 2 décimales pour l'affichage
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

  return (
    <form
      className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border bg-white  p-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Dépenses :</span>
        {form.depenses.map((dep: DepenseFormItem, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              className="rounded border px-2 py-1"
              placeholder="Libellé"
              value={dep.label}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  depenses: f.depenses.map((d: DepenseFormItem, i: number) =>
                    i === idx ? { ...d, label: e.target.value } : d
                  ),
                }))
              }
            />
            <input
              type="number"
              className="rounded border px-2 py-1"
              placeholder="Montant"
              value={dep.value}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  depenses: f.depenses.map((d: DepenseFormItem, i: number) =>
                    i === idx ? { ...d, value: e.target.value } : d
                  ),
                }))
              }
            />
            <button
              type="button"
              className="font-bold text-red-500"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  depenses: f.depenses.filter((_, i: number) => i !== idx),
                }))
              }
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 text-sm text-green-600 underline hover:text-green-700"
          onClick={() =>
            setForm((f) => ({
              ...f,
              depenses: [...f.depenses, { label: "", value: "" }],
            }))
          }
        >
          + Ajouter une dépense
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">Presta B2B :</span>
        {form.prestaB2B.map((pre: PrestaFormItem, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              className="rounded border px-2 py-1"
              placeholder="Libellé"
              value={pre.label}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  prestaB2B: f.prestaB2B.map((p: PrestaFormItem, i: number) =>
                    i === idx ? { ...p, label: e.target.value } : p
                  ),
                }))
              }
            />
            <input
              type="number"
              className="rounded border px-2 py-1"
              placeholder="Montant"
              value={pre.value}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  prestaB2B: f.prestaB2B.map((p: PrestaFormItem, i: number) =>
                    i === idx ? { ...p, value: e.target.value } : p
                  ),
                }))
              }
            />
            <button
              type="button"
              className="font-bold text-red-500"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  prestaB2B: f.prestaB2B.filter(
                    (_, i: number) => i !== idx
                  ),
                }))
              }
            >
              X
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-1 text-sm text-green-600 underline hover:text-green-700"
          onClick={() =>
            setForm((f) => ({
              ...f,
              prestaB2B: [...f.prestaB2B, { label: "", value: "" }],
            }))
          }
        >
          + Ajouter une facture B2B
        </button>
      </div>
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="CB classique"
        value={form.cbClassique}
        onChange={(e) =>
          setForm((f) => ({ ...f, cbClassique: e.target.value }))
        }
      />
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="CB sans contact"
        value={form.cbSansContact}
        onChange={(e) =>
          setForm((f) => ({ ...f, cbSansContact: e.target.value }))
        }
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            className="rounded border px-2 py-1 flex-1"
            placeholder="Espèces"
            value={form.especes}
            onChange={(e) => {
              setForm((f) => ({ ...f, especes: e.target.value }));
              setIsManuallyEdited(true);
            }}
            title="Montant calculé automatiquement mais modifiable manuellement"
          />
          {isManuallyEdited && (
            <button
              type="button"
              onClick={() => {
                const autoValue = calculateEspeces().toFixed(2);
                setForm((f) => ({ ...f, especes: autoValue }));
                setIsManuallyEdited(false);
              }}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              title="Recalculer automatiquement"
            >
              Auto
            </button>
          )}
        </div>
        {/* <span
          className={`text-xs mt-1 ${
            isManuallyEdited ? "text-orange-500" : "text-green-600"
          }`}
        >
          {isManuallyEdited ? "Modifié manuellement" : "Auto-calculé"}
        </span> */}
      </div>
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="Virement"
        value={form.virement}
        onChange={(e) =>
          setForm((f) => ({ ...f, virement: e.target.value }))
        }
      />
      <Button
        type="submit"
        className="bg-primary text-white hover:bg-green-700"
      >
        {!editingRow || editingRow._id === "" ? "Ajouter" : "Modifier"}
      </Button>
      {formStatus && (
        <span className="ml-4 text-sm font-semibold">{formStatus}</span>
      )}
    </form>
  );
}
