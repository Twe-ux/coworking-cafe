'use client';

import { useState, useEffect } from 'react';
import { calculateTotalFromDetails, formatCurrency, getEmptyCountDetails } from '@/types/cashRegister';
import type { CashCountDetails } from '@/types/cashRegister';

interface CashCountHelperProps {
  onTotalCalculated: (total: number, details: CashCountDetails) => void;
  className?: string;
}

/**
 * Cash Count Helper Component
 *
 * Aide au comptage du fond de caisse avec saisie détaillée des billets et pièces
 * Calcule automatiquement le total et permet de reporter le montant
 *
 * @param onTotalCalculated - Callback appelé avec le total et les détails du comptage
 * @param className - Classes CSS additionnelles
 */
export default function CashCountHelper({
  onTotalCalculated,
  className = ''
}: CashCountHelperProps) {
  const [countDetails, setCountDetails] = useState<CashCountDetails>(getEmptyCountDetails());
  const [total, setTotal] = useState(0);

  // Recalculer le total à chaque changement
  useEffect(() => {
    const newTotal = calculateTotalFromDetails(countDetails);
    setTotal(newTotal);
  }, [countDetails]);

  // Mettre à jour la quantité d'un billet
  const updateBillQuantity = (value: number, quantity: number) => {
    setCountDetails(prev => ({
      ...prev,
      bills: prev.bills.map(bill =>
        bill.value === value ? { ...bill, quantity } : bill
      )
    }));
  };

  // Mettre à jour la quantité d'une pièce
  const updateCoinQuantity = (value: number, quantity: number) => {
    setCountDetails(prev => ({
      ...prev,
      coins: prev.coins.map(coin =>
        coin.value === value ? { ...coin, quantity } : coin
      )
    }));
  };

  // Reporter le montant dans le formulaire principal
  const handleReport = () => {
    onTotalCalculated(total, countDetails);
  };

  // Reset
  const handleReset = () => {
    setCountDetails(getEmptyCountDetails());
    setTotal(0);
  };

  return (
    <div className={`cash-count-helper ${className}`}>
      {/* Billets */}
      <div className="cash-count-helper__section">
        <h4 className="cash-count-helper__section-title">Billets</h4>
        <table className="cash-count-helper__table">
          <thead>
            <tr>
              <th>Valeur</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {countDetails.bills.map((bill) => (
              <tr key={`bill-${bill.value}`}>
                <td>{formatCurrency(bill.value)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={bill.quantity}
                    onChange={(e) => updateBillQuantity(bill.value, parseInt(e.target.value) || 0)}
                    aria-label={`Quantité de billets de ${bill.value}€`}
                  />
                </td>
                <td className="fw-semibold">
                  {formatCurrency(bill.value * bill.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pièces */}
      <div className="cash-count-helper__section mt-4">
        <h4 className="cash-count-helper__section-title">Pièces</h4>
        <table className="cash-count-helper__table">
          <thead>
            <tr>
              <th>Valeur</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {countDetails.coins.map((coin) => (
              <tr key={`coin-${coin.value}`}>
                <td>{formatCurrency(coin.value)}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={coin.quantity}
                    onChange={(e) => updateCoinQuantity(coin.value, parseInt(e.target.value) || 0)}
                    aria-label={`Quantité de pièces de ${coin.value}€`}
                  />
                </td>
                <td className="fw-semibold">
                  {formatCurrency(coin.value * coin.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="cash-count-helper__total mt-4">
        <span>Total :</span>
        <span>{formatCurrency(total)}</span>
      </div>

      {/* Actions */}
      <div className="cash-count-helper__actions">
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-outline-secondary me-2"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={handleReport}
          className="btn btn-primary"
          disabled={total === 0}
        >
          Reporter dans la saisie
        </button>
      </div>
    </div>
  );
}
