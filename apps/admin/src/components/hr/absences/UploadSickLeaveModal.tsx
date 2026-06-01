'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleEmployee {
  id: string;
  firstName: string;
  lastName: string;
}

interface UploadSickLeaveModalProps {
  isOpen: boolean;
  employees: SimpleEmployee[];
  onClose: () => void;
  onUploaded?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export function UploadSickLeaveModal({
  isOpen,
  employees,
  onClose,
  onUploaded,
}: UploadSickLeaveModalProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setDate('');
      setFile(null);
      setError(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Format non supporté (PDF, JPG, PNG uniquement)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('Fichier trop volumineux (5 Mo max)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!employeeId || !date || !file) {
      setError('Veuillez remplir tous les champs et sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    try {
      // Find the sick_leave absence covering this date
      const res = await fetch(
        `/api/hr/absences?employeeId=${employeeId}&type=sick_leave&startDate=${date}&endDate=${date}`
      );
      const data = await res.json();

      if (!data.success || !data.data?.length) {
        setError(
          "Aucun arrêt maladie déclaré pour cet employé à cette date. Créez-le d'abord dans /admin/hr/schedule."
        );
        return;
      }

      const absenceId = data.data[0]._id;

      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`/api/hr/absences/${absenceId}/document`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setError(uploadData.error || "Erreur lors de l'upload");
        return;
      }

      toast.success('Justificatif uploadé avec succès');
      onUploaded?.();
      onClose();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Uploader justificatif AM</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Employé *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un employé" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Date de l&apos;arrêt maladie *</Label>
            <DatePicker
              date={date}
              onDateChange={setDate}
              placeholder="Sélectionner la date"
            />
          </div>

          <div>
            <Label>Justificatif (PDF, JPG, PNG — 5 Mo max) *</Label>
            <div className="mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : 'Choisir un fichier'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
          >
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={isUploading || !employeeId || !date || !file}
            className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          >
            {isUploading ? 'Upload...' : 'Uploader'}
          </Button>
        </div>
      </div>
    </div>
  );
}
