'use client';

import { useState, useEffect } from 'react';
import EmployeeButtonSelector from '@/components/common/EmployeeButtonSelector';
import CashCountHelper from '@/components/common/CashCountHelper';
import { formatCurrency } from '@/types/cashRegister';
import type { EmployeeInfo, CashCountDetails, CashRegisterEntry } from '@/types/cashRegister';

type TabType = 'direct' | 'helper';

export default function CashRegisterPage() {
  // État du formulaire
  const [activeTab, setActiveTab] = useState<TabType>('direct');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [countDetails, setCountDetails] = useState<CashCountDetails | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // État de l'historique
  const [entries, setEntries] = useState<CashRegisterEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Mock employees (à remplacer par API /api/employees/clocked)
  const [employees] = useState<EmployeeInfo[]>([
    { id: '1', firstName: 'John', lastName: 'Doe' },
    { id: '2', firstName: 'Jane', lastName: 'Smith' },
    { id: '3', firstName: 'Marc', lastName: 'Martin' }
  ]);

  // Charger les saisies du mois au montage et quand le mois change
  useEffect(() => {
    fetchEntries();
  }, [selectedMonth]);

  // Récupérer les saisies du mois
  const fetchEntries = async () => {
    setLoadingEntries(true);
    try {
      const response = await fetch(`/api/cash-register/list?month=${selectedMonth}`);
      const result = await response.json();

      if (result.success) {
        setEntries(result.data.entries);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Callback du CashCountHelper
  const handleTotalCalculated = (total: number, details: CashCountDetails) => {
    setAmount(total.toString());
    setCountDetails(details);
    // Revenir à l'onglet saisie directe avec le montant rempli
    setActiveTab('direct');
  };

  // Soumettre la saisie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedEmployee) {
      setError('Veuillez sélectionner qui a compté la caisse');
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

      const response = await fetch('/api/cash-register/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: getTodayDate(),
          amount: amountNum,
          countedBy: {
            userId: selectedEmp.id,
            name: `${selectedEmp.firstName} ${selectedEmp.lastName || ''}`
          },
          countDetails: activeTab === 'helper' ? countDetails : undefined,
          notes: notes.trim() || undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        // Reset form
        setAmount('');
        setCountDetails(undefined);
        setNotes('');
        setActiveTab('direct');
        // Recharger l'historique
        fetchEntries();
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

  // Calculer le total mensuel
  const monthlyTotal = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">💰 Fond de Caisse</h1>

          {/* Formulaire de saisie */}
          <div className="cash-register-form">
            <div className="cash-register-form__header">
              <h2>Nouvelle Saisie</h2>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Sélection employé */}
              <div className="cash-register-form__section">
                <div className="cash-register-form__section-title">
                  Qui a compté la caisse ?
                </div>
                <EmployeeButtonSelector
                  employees={employees}
                  selected={selectedEmployee}
                  onSelect={setSelectedEmployee}
                  variant="full"
                />
              </div>

              {/* Tabs */}
              <div className="cash-register-form__section">
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'direct' ? 'active' : ''}`}
                      onClick={() => setActiveTab('direct')}
                    >
                      Saisie directe
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'helper' ? 'active' : ''}`}
                      onClick={() => setActiveTab('helper')}
                    >
                      Aide au comptage
                    </button>
                  </li>
                </ul>

                {/* Contenu selon tab */}
                {activeTab === 'direct' && (
                  <div className="cash-register-form__field">
                    <label htmlFor="amount">Montant total (€)</label>
                    <input
                      type="number"
                      id="amount"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}

                {activeTab === 'helper' && (
                  <CashCountHelper onTotalCalculated={handleTotalCalculated} />
                )}
              </div>

              {/* Notes */}
              <div className="cash-register-form__section">
                <div className="cash-register-form__field">
                  <label htmlFor="notes">Notes (optionnel)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Remarques, incidents, etc."
                    rows={3}
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  ✓ Saisie enregistrée avec succès !
                </div>
              )}

              {/* Actions */}
              <div className="cash-register-form__actions">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>

          {/* Historique mensuel */}
          <div className="cash-register-history">
            <div className="cash-register-history__header">
              <h3>📊 Historique - {formatMonthDisplay(selectedMonth)}</h3>
              <select
                className="form-select w-auto"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {getMonthOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {loadingEntries ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : entries.length === 0 ? (
              <div className="alert alert-info">
                Aucune saisie pour ce mois
              </div>
            ) : (
              <>
                <table className="cash-register-history__table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure</th>
                      <th>Montant</th>
                      <th>Compté par</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry._id}>
                        <td>{formatDate(entry.date)}</td>
                        <td>{formatTime(entry.createdAt)}</td>
                        <td className="fw-bold">{formatCurrency(entry.amount)}</td>
                        <td>{entry.countedBy.name}</td>
                        <td>{entry.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="cash-register-history__total">
                  <span>Total mensuel :</span>
                  <span>{formatCurrency(monthlyTotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Helpers
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getMonthOptions(): Array<{ value: string; label: string }> {
  const options = [];
  const now = new Date();

  // 6 derniers mois
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    options.push({ value, label });
  }

  return options;
}
