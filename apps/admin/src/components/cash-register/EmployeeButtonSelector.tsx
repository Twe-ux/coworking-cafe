'use client';

import { Button } from '@/components/ui/button';
import type { EmployeeInfo } from '@/types/cashRegister';

interface EmployeeButtonSelectorProps {
  employees: EmployeeInfo[];
  selected: string | null;
  onSelect: (employeeId: string) => void;
  variant?: 'compact' | 'full';
  className?: string;
}

export function EmployeeButtonSelector({
  employees,
  selected,
  onSelect,
  variant = 'full',
  className = ''
}: EmployeeButtonSelectorProps) {
  if (!employees || employees.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">Aucun employé disponible</p>
      </div>
    );
  }

  const gridClass = variant === 'compact'
    ? 'grid grid-cols-3 sm:grid-cols-4 gap-2'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3';

  return (
    <div className={className}>
      <div className={gridClass}>
        {employees.map((employee) => {
          const isSelected = selected === employee.id;
          const displayName = employee.lastName
            ? `${employee.firstName} ${employee.lastName.charAt(0)}.`
            : employee.firstName;

          return (
            <Button
              key={employee.id}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onSelect(employee.id)}
              className="w-full"
            >
              {displayName}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
