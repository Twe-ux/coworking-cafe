'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Clock, FileText, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { UploadSickLeaveModal } from '@/components/hr/absences/UploadSickLeaveModal';

interface SimpleEmployee {
  id: string;
  firstName: string;
  lastName: string;
}

export function QuickActions() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [employees, setEmployees] = useState<SimpleEmployee[]>([]);

  useEffect(() => {
    fetch('/api/hr/employees?includeInactive=true')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEmployees(
            (data.data ?? [])
              .filter(
                (e: SimpleEmployee & { email?: string; firstName: string; lastName: string }) =>
                  e.email !== 'dev@coworkingcafe.com' &&
                  !(e.firstName === 'Admin' && e.lastName === 'Dev')
              )
              .map((e: SimpleEmployee & { _id?: string }) => ({
                id: e.id ?? e._id ?? '',
                firstName: e.firstName,
                lastName: e.lastName,
              }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          >
            <Link href="/admin/hr/employees?action=new">
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel employé
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          >
            <Link href="/admin/hr/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              Créer un créneau
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          >
            <Link href="/admin/hr/clocking-admin">
              <Clock className="mr-2 h-4 w-4" />
              Pointer un employé
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Uploader justificatif AM
          </Button>
        </CardContent>
      </Card>

      <UploadSickLeaveModal
        isOpen={isUploadModalOpen}
        employees={employees}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
