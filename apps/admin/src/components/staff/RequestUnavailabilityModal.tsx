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
import { X, CheckCircle } from 'lucide-react';
import type { UnavailabilityType } from '@/types/unavailability';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

interface RequestUnavailabilityModalProps {
  isOpen: boolean;
  employees: Employee[];
  onClose: () => void;
}

export function RequestUnavailabilityModal({
  isOpen,
  employees,
  onClose,
}: RequestUnavailabilityModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    pin: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as UnavailabilityType,
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.employeeId || !formData.pin || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError('Le code PIN doit être composé de 4 chiffres');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setError('La date de début doit être avant la date de fin');
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError('Le motif doit contenir au moins 10 caractères');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/unavailability/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'envoi de la demande');
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      employeeId: '',
      pin: '',
      startDate: '',
      endDate: '',
      type: 'vacation',
      reason: '',
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Demande envoyée !</h3>
          <p className="text-gray-600">
            Votre demande d'indisponibilité a été envoyée. Vous recevrez une réponse par email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Demander une indisponibilité</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Employee selection */}
          <div>
            <Label htmlFor="employee">Votre nom *</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, employeeId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre nom" />
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

          {/* PIN */}
          <div>
            <Label htmlFor="pin">Code PIN (4 chiffres) *</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={formData.pin}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))
              }
              placeholder="****"
            />
            <p className="mt-1 text-xs text-gray-500">
              Le même code que vous utilisez pour le pointage
            </p>
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
            <Label htmlFor="reason">Motif (min. 10 caractères) *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Expliquez la raison de votre demande..."
              rows={4}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.reason.length}/10 caractères minimum
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
          </Button>
        </div>
      </div>
    </div>
  );
}
