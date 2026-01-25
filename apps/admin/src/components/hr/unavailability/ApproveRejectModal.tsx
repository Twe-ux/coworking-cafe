'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import type { IUnavailabilityWithEmployee } from '@/types/unavailability';

const typeLabels = {
  vacation: 'Congés',
  sick: 'Maladie',
  personal: 'Personnel',
  other: 'Autre',
};

interface ApproveRejectModalProps {
  isOpen: boolean;
  mode: 'approve' | 'reject';
  request: IUnavailabilityWithEmployee;
  onConfirm: (rejectionReason?: string) => Promise<void>;
  onCancel: () => void;
}

export function ApproveRejectModal({
  isOpen,
  mode,
  request,
  onConfirm,
  onCancel,
}: ApproveRejectModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);

    if (mode === 'reject' && !rejectionReason.trim()) {
      setError('Veuillez fournir un motif de refus');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(mode === 'reject' ? rejectionReason : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {mode === 'approve' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approuver la demande
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Refuser la demande
              </>
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Request details */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4 mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {request.employee?.firstName} {request.employee?.lastName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(request.startDate).toLocaleDateString('fr-FR')} -{' '}
              {new Date(request.endDate).toLocaleDateString('fr-FR')}
            </span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-700">Type : </span>
            <span className="text-gray-600">{typeLabels[request.type]}</span>
          </div>

          {request.reason && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Motif : </span>
              <p className="text-gray-600 mt-1">{request.reason}</p>
            </div>
          )}
        </div>

        {/* Rejection reason (only for reject mode) */}
        {mode === 'reject' && (
          <div className="mb-4">
            <Label htmlFor="rejection-reason">Motif du refus *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Expliquez la raison du refus..."
              rows={4}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ce motif sera envoyé par email à l'employé
            </p>
          </div>
        )}

        {/* Confirmation message */}
        {mode === 'approve' && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            L'employé sera notifié par email de l'approbation de sa demande.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant={mode === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'En cours...'
              : mode === 'approve'
              ? 'Approuver'
              : 'Refuser'}
          </Button>
        </div>
      </div>
    </div>
  );
}
