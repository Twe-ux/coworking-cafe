"use client";

import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import type { DirectPurchase, APIResponse } from "@/types/inventory";

interface DirectPurchaseListProps {
  purchases: DirectPurchase[];
  loading: boolean;
  onRefresh?: () => void;
}

export function DirectPurchaseList({
  purchases,
  loading,
  onRefresh,
}: DirectPurchaseListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<DirectPurchase | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (purchase: DirectPurchase) => {
    setPurchaseToDelete(purchase);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!purchaseToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/direct-purchases/${purchaseToDelete._id}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as APIResponse<unknown>;

      if (data.success) {
        toast({
          title: "Achat supprimé",
          description: `L'achat du ${new Date(purchaseToDelete.date).toLocaleDateString("fr-FR")} a été supprimé`,
        });
        setDeleteDialogOpen(false);
        setPurchaseToDelete(null);
        onRefresh?.();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de supprimer l'achat",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion au serveur",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun achat direct enregistre
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>N° achat</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead className="text-center">Nb produits</TableHead>
            <TableHead className="text-right">Total HT</TableHead>
            <TableHead className="text-right">Total TTC</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase._id}>
              <TableCell className="font-medium">
                {new Date(purchase.date).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {purchase.purchaseNumber}
              </TableCell>
              <TableCell>{purchase.supplier}</TableCell>
              <TableCell className="text-center">
                {purchase.items.length}
              </TableCell>
              <TableCell className="text-right">
                {purchase.totalHT.toFixed(2)} EUR
              </TableCell>
              <TableCell className="text-right font-medium">
                {purchase.totalTTC.toFixed(2)} EUR
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => window.location.href = `/admin/inventory/direct-purchases/${purchase._id}/edit`}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeleteClick(purchase)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'achat direct</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'achat du{" "}
              <strong>
                {purchaseToDelete && new Date(purchaseToDelete.date).toLocaleDateString("fr-FR")}
              </strong>{" "}
              chez <strong>{purchaseToDelete?.supplier}</strong> ?
              <br />
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
