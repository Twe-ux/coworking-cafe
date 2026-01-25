'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import type { UnavailabilityType } from '@/types/unavailability';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  color?: string;
}

interface CreateUnavailabilityModalProps {
  isOpen: boolean;
  employees: Employee[];
  onClose: () => void;
  onCreate: (data: CreateUnavailabilityData) => Promise<void>;
  editData?: {
    id: string;
    employeeId: string;
    startDate: string;
    endDate: string;
    type: UnavailabilityType;
    reason?: string;
  };
}

export interface CreateUnavailabilityData {
  employeeId: string;
  startDate: string;
  endDate: string;
  type: UnavailabilityType;
  reason?: string;
}

export function CreateUnavailabilityModal({
  isOpen,
  employees,
  onClose,
  onCreate,
  editData,
}: CreateUnavailabilityModalProps) {
  const isEditMode = !!editData;

  const [formData, setFormData] = useState<CreateUnavailabilityData>({
    employeeId: editData?.employeeId || '',
    startDate: editData?.startDate || '',
    endDate: editData?.endDate || '',
    type: editData?.type || 'vacation',
    reason: editData?.reason || '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.employeeId || !formData.startDate || !formData.endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setError('La date de début doit être avant la date de fin');
      return;
    }

    try {
      setIsCreating(true);
      await onCreate(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      employeeId: '',
      startDate: '',
      endDate: '',
      type: 'vacation',
      reason: '',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isEditMode ? 'Modifier l\'indisponibilité' : 'Créer une indisponibilité'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Employee selection */}
          <div>
            <Label htmlFor="employee">Employé *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, employeeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Date de début *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="end-date">Date de fin *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: UnavailabilityType) =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Congés</SelectItem>
                <SelectItem value="sick">Maladie</SelectItem>
                <SelectItem value="personal">Personnel</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Motif (optionnel)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating
              ? (isEditMode ? 'Modification...' : 'Création...')
              : (isEditMode ? 'Modifier' : 'Créer')}
          </Button>
        </div>
      </div>
    </div>
  );
}
