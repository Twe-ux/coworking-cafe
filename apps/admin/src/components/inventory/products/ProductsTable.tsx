'use client'

import { useState } from 'react'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { LowStockBadge } from './LowStockBadge'
import type { Product } from '@/types/inventory'

interface ProductsTableProps {
  products: Product[]
  loading: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string) => Promise<boolean>
}

export function ProductsTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await onDelete(productToDelete._id)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Aucun produit trouvé</p>
        <p className="text-sm mt-2">Commencez par créer un nouveau produit</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Prix HT</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="font-medium">
                  {product.name}
                  <div className="text-sm text-muted-foreground">
                    {product.unit}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product.category === 'food'
                      ? 'Alimentation'
                      : 'Entretien'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {product.supplierName || 'N/A'}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {product.unitPriceHT.toFixed(2)} €
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium">
                      {product.currentStock}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      min: {product.minStock} / max: {product.maxStock}
                    </span>
                    <LowStockBadge
                      currentStock={product.currentStock}
                      minStock={product.minStock}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-col">
                    <Badge
                      variant={product.isActive ? 'default' : 'destructive'}
                    >
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    {product.hasShortDLC && (
                      <Badge variant="outline" className="text-xs">
                        DLC courte
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(product)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Désactiver
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver le produit</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver{' '}
              <strong>{productToDelete?.name}</strong> ?
              <br />
              Le produit sera marqué comme inactif mais pourra être
              réactivé plus tard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
