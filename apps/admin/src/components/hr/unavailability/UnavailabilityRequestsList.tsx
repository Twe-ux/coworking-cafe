'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { ApproveRejectModal } from './ApproveRejectModal';
import { useUnavailabilities } from '@/hooks/useUnavailabilities';
import type { IUnavailabilityWithEmployee } from '@/types/unavailability';

const typeLabels = {
  vacation: 'Congés',
  sick: 'Maladie',
  personal: 'Personnel',
  other: 'Autre',
};

const typeBadgeColors = {
  vacation: 'bg-blue-100 text-blue-800',
  sick: 'bg-red-100 text-red-800',
  personal: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export function UnavailabilityRequestsList() {
  const { unavailabilities, loading, error, updateUnavailability } = useUnavailabilities({
    status: 'pending',
  });

  const [selectedRequest, setSelectedRequest] = useState<IUnavailabilityWithEmployee | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = (request: IUnavailabilityWithEmployee) => {
    setSelectedRequest(request);
    setModalMode('approve');
  };

  const handleReject = (request: IUnavailabilityWithEmployee) => {
    setSelectedRequest(request);
    setModalMode('reject');
  };

  const handleConfirm = async (rejectionReason?: string) => {
    if (!selectedRequest || !modalMode) return;

    const status = modalMode === 'approve' ? 'approved' : 'rejected';
    await updateUnavailability(selectedRequest._id, {
      status,
      rejectionReason,
    });

    setSelectedRequest(null);
    setModalMode(null);
  };

  const handleCancel = () => {
    setSelectedRequest(null);
    setModalMode(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-red-600">Erreur: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (unavailabilities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Aucune demande en attente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {unavailabilities.map((request) => (
          <Card key={request._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  {request.employee?.firstName} {request.employee?.lastName}
                </CardTitle>
                <Badge className={typeBadgeColors[request.type]}>
                  {typeLabels[request.type]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Du {new Date(request.startDate).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(request.endDate).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Reason */}
              {request.reason && (
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">Motif :</p>
                  <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(request)}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(request)}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approve/Reject Modal */}
      {selectedRequest && modalMode && (
        <ApproveRejectModal
          isOpen={true}
          mode={modalMode}
          request={selectedRequest}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
