'use client';

import type { EmployeeInfo } from '@/types/cashRegister';

interface EmployeeButtonSelectorProps {
  employees: EmployeeInfo[];
  selected: string | null;
  onSelect: (employeeId: string) => void;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Employee Button Selector Component
 *
 * Affiche une grille de boutons pour sélectionner un employé
 * Utilisé pour le module de fond de caisse
 *
 * @param employees - Liste des employés disponibles
 * @param selected - ID de l'employé sélectionné
 * @param onSelect - Callback appelé lors de la sélection
 * @param variant - Style d'affichage ('compact' pour widget, 'full' pour page)
 * @param className - Classes CSS additionnelles
 */
export default function EmployeeButtonSelector({
  employees,
  selected,
  onSelect,
  variant = 'full',
  className = ''
}: EmployeeButtonSelectorProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className={`employee-selector ${className}`}>
        <p className="text-muted">Aucun employé disponible</p>
      </div>
    );
  }

  return (
    <div className={`employee-selector employee-selector--${variant} ${className}`}>
      <div className="employee-selector__grid">
        {employees.map((employee) => {
          const isSelected = selected === employee.id;
          const displayName = employee.lastName
            ? `${employee.firstName} ${employee.lastName.charAt(0)}.`
            : employee.firstName;

          return (
            <button
              key={employee.id}
              type="button"
              onClick={() => onSelect(employee.id)}
              className={`employee-selector__button ${
                isSelected ? 'employee-selector__button--active' : ''
              }`}
              aria-pressed={isSelected}
              aria-label={`Sélectionner ${employee.firstName} ${employee.lastName || ''}`}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
