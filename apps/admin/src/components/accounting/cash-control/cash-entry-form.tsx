import { Button } from "@/components/ui/button";
import React from "react";
import type { CashEntryFormData, CashEntryRow } from "@/types/accounting";
import { useCashCalculations } from "./hooks/useCashCalculations";
import { DynamicItemsList } from "./form-fields/DynamicItemsList";
import { PaymentMethodsFields } from "./form-fields/PaymentMethodsFields";
import { EspecesField } from "./form-fields/EspecesField";

// Types locaux pour les items du formulaire (string values)
type DepenseFormItem = { label: string; value: string };
type PrestaFormItem = { label: string; value: string };

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
  const { isManuallyEdited, setIsManuallyEdited, calculateEspeces } =
    useCashCalculations({
      form,
      editingRow,
      setForm,
    });

  // Handlers pour Dépenses
  const handleDepenseChange = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      depenses: f.depenses.map((d: DepenseFormItem, i: number) =>
        i === index ? { ...d, [field]: value } : d
      ),
    }));
  };

  const handleDepenseRemove = (index: number) => {
    setForm((f) => ({
      ...f,
      depenses: f.depenses.filter((_, i: number) => i !== index),
    }));
  };

  const handleDepenseAdd = () => {
    setForm((f) => ({
      ...f,
      depenses: [...f.depenses, { label: "", value: "" }],
    }));
  };

  // Handlers pour Presta B2B
  const handlePrestaChange = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    setForm((f) => ({
      ...f,
      prestaB2B: f.prestaB2B.map((p: PrestaFormItem, i: number) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handlePrestaRemove = (index: number) => {
    setForm((f) => ({
      ...f,
      prestaB2B: f.prestaB2B.filter((_, i: number) => i !== index),
    }));
  };

  const handlePrestaAdd = () => {
    setForm((f) => ({
      ...f,
      prestaB2B: [...f.prestaB2B, { label: "", value: "" }],
    }));
  };

  // Handler pour Espèces
  const handleEspecesChange = (value: string) => {
    setForm((f) => ({ ...f, especes: value }));
    setIsManuallyEdited(true);
  };

  const handleEspecesRecalculate = () => {
    const autoValue = calculateEspeces().toFixed(2);
    setForm((f) => ({ ...f, especes: autoValue }));
    setIsManuallyEdited(false);
  };

  return (
    <form
      className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border bg-white p-4"
      onSubmit={onSubmit}
    >
      <DynamicItemsList
        title="Dépenses :"
        items={form.depenses}
        onItemChange={handleDepenseChange}
        onItemRemove={handleDepenseRemove}
        onItemAdd={handleDepenseAdd}
        addButtonText="+ Ajouter une dépense"
      />

      <DynamicItemsList
        title="Presta B2B :"
        items={form.prestaB2B}
        onItemChange={handlePrestaChange}
        onItemRemove={handlePrestaRemove}
        onItemAdd={handlePrestaAdd}
        addButtonText="+ Ajouter une facture B2B"
      />

      <PaymentMethodsFields
        cbClassique={form.cbClassique}
        cbSansContact={form.cbSansContact}
        virement={form.virement}
        onCbClassiqueChange={(value) =>
          setForm((f) => ({ ...f, cbClassique: value }))
        }
        onCbSansContactChange={(value) =>
          setForm((f) => ({ ...f, cbSansContact: value }))
        }
        onVirementChange={(value) => setForm((f) => ({ ...f, virement: value }))}
      />

      <EspecesField
        value={form.especes}
        isManuallyEdited={isManuallyEdited}
        onChange={handleEspecesChange}
        onRecalculate={handleEspecesRecalculate}
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
