'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface MissingDoc {
  _id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
}

interface MissingSickLeaveDocsModalProps {
  isOpen: boolean;
  missingDocs: MissingDoc[];
  onClose: () => void;
  onAllResolved: () => void;
}

function formatDateFr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function MissingSickLeaveDocsModal({
  isOpen,
  missingDocs,
  onClose,
  onAllResolved,
}: MissingSickLeaveDocsModalProps) {
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = async (
    absenceId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Format non supporté (PDF, JPG, PNG uniquement)');
      if (fileInputsRef.current[absenceId]) fileInputsRef.current[absenceId]!.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (5 Mo max)');
      if (fileInputsRef.current[absenceId]) fileInputsRef.current[absenceId]!.value = '';
      return;
    }

    setUploading(absenceId);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/hr/absences/${absenceId}/document`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploaded((prev) => new Set(prev).add(absenceId));
        toast.success('Justificatif uploadé');
      } else {
        toast.error(data.error || "Erreur lors de l'upload");
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setUploading(null);
      if (fileInputsRef.current[absenceId]) fileInputsRef.current[absenceId]!.value = '';
    }
  };

  const allResolved = missingDocs.every((d) => uploaded.has(d._id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Justificatifs AM manquants</h3>
            <p className="text-sm text-muted-foreground">
              {missingDocs.length} arrêt{missingDocs.length > 1 ? 's' : ''} maladie sans justificatif ce mois-ci
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {missingDocs.map((doc) => {
            const isDone = uploaded.has(doc._id);
            const isUploading = uploading === doc._id;

            return (
              <div
                key={doc._id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateFr(doc.startDate)} → {formatDateFr(doc.endDate)}
                  </p>
                </div>

                <div className="ml-3 flex-shrink-0">
                  {isDone ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Uploadé
                    </Badge>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => fileInputsRef.current[doc._id]?.click()}
                        className="border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Upload className="mr-1 h-3 w-3" />
                        {isUploading ? 'Upload...' : 'Uploader'}
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        ref={(el) => { fileInputsRef.current[doc._id] = el; }}
                        onChange={(e) => handleFileChange(doc._id, e)}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={onAllResolved}
            className="border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            Continuer sans justificatif
          </Button>
          <Button
            variant="outline"
            onClick={onAllResolved}
            disabled={!allResolved}
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
