"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";

// Types partagés
export type PrestaB2BEntry = { label: string; value: string };
export type DepenseEntry = { label: string; value: string };

// Composant pour une entrée Presta B2B
export function PrestaB2BInput({
  entry,
  index,
  onChange,
  onRemove,
}: {
  entry: PrestaB2BEntry;
  index: number;
  onChange: (index: number, field: keyof PrestaB2BEntry, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor={`presta-label-${index}`}>Label</Label>
        <Input
          id={`presta-label-${index}`}
          type="text"
          value={entry.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          placeholder="Description prestation"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor={`presta-value-${index}`}>Montant</Label>
        <Input
          id={`presta-value-${index}`}
          type="number"
          step="0.01"
          value={entry.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={index === 0}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour une entrée Dépense
export function DepenseInput({
  entry,
  index,
  onChange,
  onRemove,
}: {
  entry: DepenseEntry;
  index: number;
  onChange: (index: number, field: keyof DepenseEntry, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor={`depense-label-${index}`}>Label</Label>
        <Input
          id={`depense-label-${index}`}
          type="text"
          value={entry.label}
          onChange={(e) => onChange(index, "label", e.target.value)}
          placeholder="Description dépense"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor={`depense-value-${index}`}>Montant</Label>
        <Input
          id={`depense-value-${index}`}
          type="number"
          step="0.01"
          value={entry.value}
          onChange={(e) => onChange(index, "value", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
          disabled={index === 0}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Composant pour les champs de paiement
export function PaymentFields({
  form,
  onChange,
}: {
  form: {
    virement: string;
    especes: string;
    cbClassique: string;
    cbSansContact: string;
  };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="virement">Virement</Label>
        <Input
          id="virement"
          type="number"
          step="0.01"
          value={form.virement}
          onChange={(e) => onChange("virement", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="especes">Espèces</Label>
        <Input
          id="especes"
          type="number"
          step="0.01"
          value={form.especes}
          onChange={(e) => onChange("especes", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="cbClassique">CB Classique</Label>
        <Input
          id="cbClassique"
          type="number"
          step="0.01"
          value={form.cbClassique}
          onChange={(e) => onChange("cbClassique", e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <Label htmlFor="cbSansContact">CB Sans Contact</Label>
        <Input
          id="cbSansContact"
          type="number"
          step="0.01"
          value={form.cbSansContact}
          onChange={(e) => onChange("cbSansContact", e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
