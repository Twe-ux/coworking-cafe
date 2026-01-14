"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  DepenseEntry,
  DepenseInput,
  PaymentFields,
  PrestaB2BEntry,
  PrestaB2BInput,
} from "./form-components";

// Type pour le formulaire
export type CashEntryForm = {
  date: string;
  prestaB2B: PrestaB2BEntry[];
  depenses: DepenseEntry[];
  virement: string;
  especes: string;
  cbClassique: string;
  cbSansContact: string;
};

// Props du composant
type CashEntryFormProps = {
  onSubmit: (formData: CashEntryForm) => void;
  isLoading?: boolean;
};

export function CashEntryForm({
  onSubmit,
  isLoading = false,
}: CashEntryFormProps) {
  const [form, setForm] = useState<CashEntryForm>({
    date: new Date().toISOString().slice(0, 10),
    prestaB2B: [{ label: "", value: "" }],
    depenses: [{ label: "", value: "" }],
    virement: "",
    especes: "",
    cbClassique: "",
    cbSansContact: "",
  });

  // Gestionnaires pour les prestations B2B
  const handlePrestaB2BChange = (
    index: number,
    field: keyof PrestaB2BEntry,
    value: string,
  ) => {
    const newPrestaB2B = [...form.prestaB2B];
    newPrestaB2B[index] = { ...newPrestaB2B[index], [field]: value };
    setForm({ ...form, prestaB2B: newPrestaB2B });
  };

  const addPrestaB2B = () => {
    setForm({
      ...form,
      prestaB2B: [...form.prestaB2B, { label: "", value: "" }],
    });
  };

  const removePrestaB2B = (index: number) => {
    if (form.prestaB2B.length > 1) {
      const newPrestaB2B = form.prestaB2B.filter((_, i) => i !== index);
      setForm({ ...form, prestaB2B: newPrestaB2B });
    }
  };

  // Gestionnaires pour les dépenses
  const handleDepenseChange = (
    index: number,
    field: keyof DepenseEntry,
    value: string,
  ) => {
    const newDepenses = [...form.depenses];
    newDepenses[index] = { ...newDepenses[index], [field]: value };
    setForm({ ...form, depenses: newDepenses });
  };

  const addDepense = () => {
    setForm({
      ...form,
      depenses: [...form.depenses, { label: "", value: "" }],
    });
  };

  const removeDepense = (index: number) => {
    if (form.depenses.length > 1) {
      const newDepenses = form.depenses.filter((_, i) => i !== index);
      setForm({ ...form, depenses: newDepenses });
    }
  };

  // Gestionnaire pour les champs de paiement
  const handlePaymentChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  // Gestionnaire de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      prestaB2B: [{ label: "", value: "" }],
      depenses: [{ label: "", value: "" }],
      virement: "",
      especes: "",
      cbClassique: "",
      cbSansContact: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Entrée de Caisse</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          {/* Prestations B2B */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Prestations B2B</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPrestaB2B}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
            {form.prestaB2B.map((entry, index) => (
              <PrestaB2BInput
                key={index}
                entry={entry}
                index={index}
                onChange={handlePrestaB2BChange}
                onRemove={removePrestaB2B}
              />
            ))}
          </div>

          {/* Dépenses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Dépenses</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDepense}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
            {form.depenses.map((entry, index) => (
              <DepenseInput
                key={index}
                entry={entry}
                index={index}
                onChange={handleDepenseChange}
                onRemove={removeDepense}
              />
            ))}
          </div>

          {/* Champs de paiement */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Moyens de Paiement</Label>
            <PaymentFields form={form} onChange={handlePaymentChange} />
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
            >
              Réinitialiser
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
