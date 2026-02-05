'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeButtonSelector from './EmployeeButtonSelector';
import type { EmployeeInfo } from '@/types/cashRegister';

interface CashRegisterWidgetProps {
  employees: EmployeeInfo[];
  className?: string;
}

/**
 * Cash Register Widget Component
 *
 * Widget compact pour la saisie rapide du fond de caisse depuis le dashboard
 * Redirige vers la page complète pour voir l'historique
 *
 * @param employees - Liste des employés disponibles
 * @param className - Classes CSS additionnelles
 */
export default function CashRegisterWidget({
  employees,
  className = ''
}: CashRegisterWidgetProps) {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedEmployee) {
      setError('Veuillez sélectionner un employé');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Montant invalide');
      return;
    }

    setLoading(true);

    try {
      const selectedEmp = employees.find(e => e.id === selectedEmployee);
      if (!selectedEmp) {
        setError('Employé introuvable');
        return;
      }

      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const response = await fetch('/api/cash-register/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          amount: amountNum,
          countedBy: {
            userId: selectedEmp.id,
            name: `${selectedEmp.firstName} ${selectedEmp.lastName || ''}`
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setAmount('');
        setSelectedEmployee(null);
        // Auto-reset after 2s
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(result.error || 'Erreur lors de la saisie');
      }
    } catch (err) {
      setError('Erreur lors de la saisie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        <h3 className="card-title h5 mb-3">💰 Fond de Caisse</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Qui a compté ?</label>
            <EmployeeButtonSelector
              employees={employees}
              selected={selectedEmployee}
              onSelect={setSelectedEmployee}
              variant="compact"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="widget-amount" className="form-label small fw-semibold">
              Montant (€)
            </label>
            <input
              type="number"
              id="widget-amount"
              className="form-control"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger alert-sm py-2 mb-3" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-sm py-2 mb-3" role="alert">
              ✓ Enregistré !
            </div>
          )}

          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => router.push('/cash-register')}
            >
              Voir l'historique →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
