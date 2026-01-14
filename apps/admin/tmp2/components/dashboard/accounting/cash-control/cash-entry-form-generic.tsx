"use client";

import { AdvancedForm } from "@/components/ui/advanced-form";
import { AdvancedFormConfig } from "@/hooks/use-advanced-form";

// Types métier
export type PrestaB2BEntry = {
  label: string;
  value: string;
};

export type DepenseEntry = {
  label: string;
  value: string;
};

export type CashEntryFormData = {
  date: string;
  prestaB2B: PrestaB2BEntry[];
  depenses: DepenseEntry[];
  virement: string;
  especes: string;
  cbClassique: string;
  cbSansContact: string;
};

// Props du composant
type CashEntryFormGenericProps = {
  onSubmit: (formData: CashEntryFormData) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CashEntryFormData>;
};

// Configuration du formulaire générique
function createCashEntryFormConfig(
  onSubmit: (data: CashEntryFormData) => void | Promise<void>,
  initialData?: Partial<CashEntryFormData>,
): AdvancedFormConfig<CashEntryFormData> {
  const defaultData: CashEntryFormData = {
    date: new Date().toISOString().slice(0, 10),
    prestaB2B: [{ label: "", value: "" }],
    depenses: [{ label: "", value: "" }],
    virement: "",
    especes: "",
    cbClassique: "",
    cbSansContact: "",
    ...initialData,
  };

  return {
    initialValues: defaultData,
    onSubmit,
    submitLabel: "Enregistrer l'entrée",
    validateOnChange: true,
    sections: [
      // Section 1: Informations générales
      {
        title: "Informations générales",
        description: "Date et informations de base",
        fields: [
          {
            id: "date",
            type: "text",
            label: "Date",
            required: true,
            placeholder: "Sélectionnez une date",
          },
        ],
      },

      // Section 2: Prestations B2B (Liste dynamique)
      {
        title: "Prestations B2B",
        description: "Gestion des prestations Business to Business",
        collapsible: true,
        defaultExpanded: true,
        fields: [
          {
            id: "prestaB2B",
            type: "dynamic-list",
            label: "Prestations B2B",
            minItems: 1,
            maxItems: 10,
            showIndexes: true,
            defaultItem: { label: "", value: "" },
            itemFields: {
              label: {
                type: "text",
                label: "Description",
                placeholder: "Ex: Formation, Conseil...",
                required: true,
                className: "col-span-2",
              },
              value: {
                type: "number",
                label: "Montant (€)",
                placeholder: "0.00",
                required: true,
                min: 0,
                step: 0.01,
                className: "col-span-1",
              },
            },
            helper: "Ajoutez les prestations B2B de la journée",
          },
        ],
      },

      // Section 3: Dépenses (Liste dynamique)
      {
        title: "Dépenses",
        description: "Gestion des dépenses quotidiennes",
        collapsible: true,
        defaultExpanded: true,
        fields: [
          {
            id: "depenses",
            type: "dynamic-list",
            label: "Dépenses",
            minItems: 1,
            maxItems: 20,
            showIndexes: true,
            defaultItem: { label: "", value: "" },
            itemFields: {
              label: {
                type: "text",
                label: "Description",
                placeholder: "Ex: Fournitures, Maintenance...",
                required: true,
                className: "col-span-2",
              },
              value: {
                type: "number",
                label: "Montant (€)",
                placeholder: "0.00",
                required: true,
                min: 0,
                step: 0.01,
                className: "col-span-1",
              },
            },
            helper: "Enregistrez toutes les dépenses de la journée",
          },
        ],
      },

      // Section 4: Moyens de paiement
      {
        title: "Moyens de paiement",
        description: "Répartition des encaissements par mode de paiement",
        layout: "grid",
        columns: 2,
        fields: [
          {
            id: "virement",
            type: "number",
            label: "Virement (€)",
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            helper: "Montant total des virements reçus",
          },
          {
            id: "especes",
            type: "number",
            label: "Espèces (€)",
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            helper: "Montant total en espèces",
          },
          {
            id: "cbClassique",
            type: "number",
            label: "CB Classique (€)",
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            helper: "Paiements par carte classique",
          },
          {
            id: "cbSansContact",
            type: "number",
            label: "CB Sans Contact (€)",
            placeholder: "0.00",
            min: 0,
            step: 0.01,
            helper: "Paiements sans contact",
          },
        ],
      },
    ],
  };
}

// Composant principal utilisant le système générique
export function CashEntryFormGeneric({
  onSubmit,
  isLoading: _isLoading = false,
  initialData,
}: CashEntryFormGenericProps) {
  // Configuration du formulaire
  const formConfig = createCashEntryFormConfig(onSubmit, initialData);

  return (
    <div className="mx-auto max-w-4xl">
      <AdvancedForm config={formConfig} className="bg-background" />
    </div>
  );
}

// Types exportés dans les interfaces ci-dessus

// Composant avec validation avancée
export function CashEntryFormWithValidation({
  onSubmit,
  isLoading: _isLoading = false,
  initialData,
}: CashEntryFormGenericProps) {
  // Version avec validation métier avancée
  const handleSubmitWithValidation = async (data: CashEntryFormData) => {
    // Calculs automatiques
    const totalPrestaB2B = data.prestaB2B.reduce(
      (sum, item) => sum + (parseFloat(item.value) || 0),
      0,
    );

    const totalDepenses = data.depenses.reduce(
      (sum, item) => sum + (parseFloat(item.value) || 0),
      0,
    );

    const totalPayments =
      (parseFloat(data.virement) || 0) +
      (parseFloat(data.especes) || 0) +
      (parseFloat(data.cbClassique) || 0) +
      (parseFloat(data.cbSansContact) || 0);

    // Validation métier
    if (totalPayments === 0) {
      throw new Error("Au moins un moyen de paiement doit être renseigné");
    }

    // Enrichissement des données avec calculs
    const enrichedData = {
      ...data,
      metadata: {
        totalPrestaB2B,
        totalDepenses,
        totalPayments,
        balance: totalPayments - totalDepenses,
        calculatedAt: new Date().toISOString(),
      },
    };

    console.log("Données enrichies:", enrichedData);
    await onSubmit(data);
  };

  const enhancedConfig = createCashEntryFormConfig(
    handleSubmitWithValidation,
    initialData,
  );

  // Ajout d'une section de résumé
  enhancedConfig.sections.push({
    title: "Résumé automatique",
    description: "Calculs et totaux générés automatiquement",
    fields: [
      {
        id: "summary",
        type: "object",
        label: "Calculs",
        fields: [
          {
            id: "info",
            type: "text",
            label: "Information",
            disabled: true,
            placeholder:
              "Les totaux seront calculés automatiquement lors de la sauvegarde",
            helper: "Totaux PrestaB2B, Dépenses et Balance seront générés",
          },
        ],
      },
    ],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <AdvancedForm config={enhancedConfig} className="bg-background" />
    </div>
  );
}
