"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { DirectPurchase } from "@/types/inventory";

interface DirectPurchaseListProps {
  purchases: DirectPurchase[];
  loading: boolean;
}

export function DirectPurchaseList({
  purchases,
  loading,
}: DirectPurchaseListProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>N achat</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead className="text-center">Nb produits</TableHead>
          <TableHead className="text-right">Total HT</TableHead>
          <TableHead className="text-right">Total TTC</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
