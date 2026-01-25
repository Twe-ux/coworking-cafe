'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { Employee, EmployeeRole } from '@/types/hr';

interface PromoteToAdminModalProps {
  isOpen: boolean;
  employee: Employee;
  onClose: () => void;
  onConfirm: (employeeId: string, newRole: EmployeeRole, pin: string) => Promise<void>;
}

export function PromoteToAdminModal({
  isOpen,
  employee,
  onClose,
  onConfirm,
}: PromoteToAdminModalProps) {
  const isCurrentlyAdmin = employee.employeeRole === 'Manager' || employee.employeeRole === 'Assistant manager';
  const [newRole, setNewRole] = useState<EmployeeRole>(isCurrentlyAdmin ? 'Employé polyvalent' : 'Manager');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    // Validation PIN seulement si passage en admin
    const needsPin = newRole !== 'Employé polyvalent';

    if (needsPin) {
      if (!pin || !confirmPin) {
        setError('Veuillez saisir le PIN dans les deux champs');
        return;
      }

      if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        setError('Le PIN doit être composé de 6 chiffres');
        return;
      }

      if (pin !== confirmPin) {
        setError('Les deux PIN ne correspondent pas');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onConfirm(employee.id, newRole, needsPin ? pin : '');
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de rôle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewRole(isCurrentlyAdmin ? 'Employé polyvalent' : 'Manager');
    setPin('');
    setConfirmPin('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">
              {isCurrentlyAdmin ? 'Passer en Staff' : 'Passer en Admin'}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Action sensible</p>
              <p className="text-xs mt-1">
                {isCurrentlyAdmin
                  ? "Cet employé perdra ses privilèges d'administration et son PIN sera supprimé."
                  : "Cet employé obtiendra des privilèges d'administration et pourra se connecter avec un PIN 6 chiffres."
                }
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Employee info */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">Employé</p>
            <p className="text-base font-semibold">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-sm text-gray-500">{employee.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Rôle actuel : <span className="font-medium">{employee.employeeRole}</span>
            </p>
          </div>

          {/* New role selection */}
          <div>
            <Label htmlFor="newRole">Nouveau rôle *</Label>
            <Select value={newRole} onValueChange={(value) => setNewRole(value as EmployeeRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {isCurrentlyAdmin ? (
                  <SelectItem value="Employé polyvalent">Employé polyvalent</SelectItem>
                ) : (
                  <>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Assistant manager">Assistant manager</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {isCurrentlyAdmin
                ? "L'employé redeviendra un staff sans accès admin"
                : "Les deux rôles ont accès admin, choisissez selon la fonction réelle"
              }
            </p>
          </div>

          {/* PIN creation - Only for promotion to admin */}
          {!isCurrentlyAdmin && (
            <>
              <div>
                <Label htmlFor="pin">Créer un PIN 6 chiffres *</Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ce PIN permettra à l'employé de se connecter à l'interface admin
                </p>
              </div>

              {/* PIN confirmation */}
              <div>
                <Label htmlFor="confirmPin">Confirmer le PIN *</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (isCurrentlyAdmin ? 'Rétrogradation...' : 'Promotion...')
              : 'Confirmer'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
