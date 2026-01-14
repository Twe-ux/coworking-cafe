import React from "react";

interface EspecesFieldProps {
  value: string;
  isManuallyEdited: boolean;
  onChange: (value: string) => void;
  onRecalculate: () => void;
}

/**
 * Composant pour le champ Espèces avec auto-calcul
 * et possibilité de modification manuelle
 */
export function EspecesField({
  value,
  isManuallyEdited,
  onChange,
  onRecalculate,
}: EspecesFieldProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.01"
          className="rounded border px-2 py-1 flex-1"
          placeholder="Espèces"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          title="Montant calculé automatiquement mais modifiable manuellement"
        />
        {isManuallyEdited && (
          <button
            type="button"
            onClick={onRecalculate}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            title="Recalculer automatiquement"
          >
            Auto
          </button>
        )}
      </div>
    </div>
  );
}
