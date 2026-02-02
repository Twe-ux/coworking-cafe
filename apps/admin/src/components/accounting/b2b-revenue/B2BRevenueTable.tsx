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
import { Pencil, Trash2 } from "lucide-react";
import type { B2BRevenueRow } from "@/types/accounting";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface B2BRevenueTableProps {
  data: B2BRevenueRow[];
  isLoading: boolean;
  onEdit: (entry: B2BRevenueRow) => void;
  onDelete: (entry: B2BRevenueRow) => void;
}

export function B2BRevenueTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: B2BRevenueTableProps) {
  const [deleteEntry, setDeleteEntry] = useState<B2BRevenueRow | null>(null);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const confirmDelete = () => {
    if (deleteEntry) {
      onDelete(deleteEntry);
    }
    setDeleteEntry(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">HT (€)</TableHead>
              <TableHead className="text-center">TTC (€)</TableHead>
              <TableHead className="text-center">TVA (€)</TableHead>
              <TableHead className="text-center">Taux TVA</TableHead>
              <TableHead className="text-center">Notes</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune entrée pour cette période
                </TableCell>
              </TableRow>
            ) : (
              data.map((entry) => {
                const tvaRate = entry.ht > 0 ? ((entry.tva / entry.ht) * 100).toFixed(1) : '0';

                return (
                  <TableRow key={entry._id}>
                    <TableCell className="text-center font-medium">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.ht.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {entry.ttc.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.tva.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tvaRate} %
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {entry.notes || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(entry)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteEntry(entry)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteEntry} onOpenChange={(open) => !open && setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer l'entrée CA B2B du{" "}
              {deleteEntry?.date ? formatDate(deleteEntry.date) : ""} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
