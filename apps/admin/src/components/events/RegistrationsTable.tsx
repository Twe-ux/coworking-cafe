"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import type { RegistrationStatus } from "@coworking-cafe/database";
import type { RegistrationItem } from "@/hooks/useRegistrations";

interface RegistrationsTableProps {
  registrations: RegistrationItem[];
  loading: boolean;
  onStatusChange: (registrationId: string, newStatus: RegistrationStatus) => void;
  onDelete: (registrationId: string) => void;
}

const statusColors: Record<RegistrationStatus, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<RegistrationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

export function RegistrationsTable({
  registrations,
  loading,
  onStatusChange,
  onDelete,
}: RegistrationsTableProps) {
  if (registrations.length === 0 && !loading) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Aucune inscription trouvée</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Date inscription</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => (
            <TableRow key={reg._id}>
              <TableCell className="font-medium">
                {reg.firstName} {reg.lastName}
              </TableCell>
              <TableCell>
                <a
                  href={`mailto:${reg.email}`}
                  className="text-primary hover:underline"
                >
                  {reg.email}
                </a>
              </TableCell>
              <TableCell>
                {reg.phone ? (
                  <a href={`tel:${reg.phone}`} className="hover:underline">
                    {reg.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(reg.registeredAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[reg.status]}>
                  {statusLabels[reg.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {reg.status !== "confirmed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusChange(reg._id, "confirmed")}
                      title="Confirmer"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  {reg.status !== "pending" && reg.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusChange(reg._id, "pending")}
                      title="Mettre en attente"
                    >
                      <Clock className="h-4 w-4 text-yellow-500" />
                    </Button>
                  )}
                  {reg.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusChange(reg._id, "cancelled")}
                      title="Annuler"
                    >
                      <XCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reg._id)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
