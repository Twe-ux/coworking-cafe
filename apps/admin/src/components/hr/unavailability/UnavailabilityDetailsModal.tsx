'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Edit, Trash2, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { formatDateFr, calculateDays } from '@/lib/utils/format-date';
import type { IUnavailabilityWithEmployee } from '@/types/unavailability';

const typeLabels = {
  vacation: 'Congés',
  sick: 'Maladie',
  personal: 'Personnel',
  other: 'Autre',
};

const statusLabels = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

interface UnavailabilityDetailsModalProps {
  isOpen: boolean;
  unavailability: IUnavailabilityWithEmployee;
  onClose: () => void;
  onEdit: (unavailability: IUnavailabilityWithEmployee) => void;
  onDelete: (id: string) => Promise<void>;
}

export function UnavailabilityDetailsModal({
  isOpen,
  unavailability,
  onClose,
  onEdit,
  onDelete,
}: UnavailabilityDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(unavailability._id);
      onClose();
    } catch (error) {
      console.error('Error deleting unavailability:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  const days = calculateDays(unavailability.startDate, unavailability.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Détails de l'indisponibilité</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Employee */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200"
            >
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Employé</p>
              <p className="font-medium">
                {unavailability.employee?.firstName} {unavailability.employee?.lastName}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <span
              className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-medium ${
                statusColors[unavailability.status]
              }`}
            >
              {statusLabels[unavailability.status]}
            </span>
          </div>

          {/* Type */}
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{typeLabels[unavailability.type]}</p>
          </div>

          {/* Dates */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Période</span>
            </div>
            <p className="mt-2">
              <span className="font-medium">{formatDateFr(unavailability.startDate)}</span>
              {' → '}
              <span className="font-medium">{formatDateFr(unavailability.endDate)}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {days} jour{days > 1 ? 's' : ''}
            </p>
          </div>

          {/* Reason */}
          {unavailability.reason && (
            <div>
              <div className="flex items-center gap-2 text-gray-700">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Motif</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{unavailability.reason}</p>
            </div>
          )}

          {/* Rejection reason */}
          {unavailability.status === 'rejected' && unavailability.rejectionReason && (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Motif du refus</p>
              <p className="mt-1 text-sm text-red-700">{unavailability.rejectionReason}</p>
            </div>
          )}

          {/* Created by */}
          <div className="text-xs text-gray-500">
            {unavailability.requestedBy === 'admin' ? (
              <span>Créée par l'administration</span>
            ) : (
              <span>Demandée par l'employé</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit(unavailability)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>

            <p className="mb-6 text-sm text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette indisponibilité ?
              <br />
              <span className="font-medium">
                {unavailability.employee?.firstName} {unavailability.employee?.lastName}
              </span>
              {' '}du{' '}
              <span className="font-medium">{formatDateFr(unavailability.startDate)}</span>
              {' '}au{' '}
              <span className="font-medium">{formatDateFr(unavailability.endDate)}</span>
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
