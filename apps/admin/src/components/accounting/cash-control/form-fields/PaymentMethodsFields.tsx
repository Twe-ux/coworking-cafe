import React from "react";

interface PaymentMethodsFieldsProps {
  cbClassique: string;
  cbSansContact: string;
  virement: string;
  onCbClassiqueChange: (value: string) => void;
  onCbSansContactChange: (value: string) => void;
  onVirementChange: (value: string) => void;
}

/**
 * Composant pour les champs des moyens de paiement
 * (CB classique, CB sans contact, Virement)
 */
export function PaymentMethodsFields({
  cbClassique,
  cbSansContact,
  virement,
  onCbClassiqueChange,
  onCbSansContactChange,
  onVirementChange,
}: PaymentMethodsFieldsProps) {
  return (
    <>
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="CB classique"
        value={cbClassique}
        onChange={(e) => onCbClassiqueChange(e.target.value)}
      />
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="CB sans contact"
        value={cbSansContact}
        onChange={(e) => onCbSansContactChange(e.target.value)}
      />
      <input
        type="number"
        className="rounded border px-2 py-1"
        placeholder="Virement"
        value={virement}
        onChange={(e) => onVirementChange(e.target.value)}
      />
    </>
  );
}
