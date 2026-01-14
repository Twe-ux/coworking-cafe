import React from "react";

interface DynamicItem {
  label: string;
  value: string;
}

interface DynamicItemsListProps {
  title: string;
  items: DynamicItem[];
  onItemChange: (index: number, field: "label" | "value", value: string) => void;
  onItemRemove: (index: number) => void;
  onItemAdd: () => void;
  addButtonText: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
}

/**
 * Composant réutilisable pour afficher une liste dynamique d'items
 * avec label et valeur (utilisé pour Dépenses et Presta B2B)
 */
export function DynamicItemsList({
  title,
  items,
  onItemChange,
  onItemRemove,
  onItemAdd,
  addButtonText,
  labelPlaceholder = "Libellé",
  valuePlaceholder = "Montant",
}: DynamicItemsListProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">{title}</span>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            className="rounded border px-2 py-1"
            placeholder={labelPlaceholder}
            value={item.label}
            onChange={(e) => onItemChange(idx, "label", e.target.value)}
          />
          <input
            type="number"
            className="rounded border px-2 py-1"
            placeholder={valuePlaceholder}
            value={item.value}
            onChange={(e) => onItemChange(idx, "value", e.target.value)}
          />
          <button
            type="button"
            className="font-bold text-red-500"
            onClick={() => onItemRemove(idx)}
          >
            X
          </button>
        </div>
      ))}
      <button
        type="button"
        className="mt-1 text-sm text-green-600 underline hover:text-green-700"
        onClick={onItemAdd}
      >
        {addButtonText}
      </button>
    </div>
  );
}
