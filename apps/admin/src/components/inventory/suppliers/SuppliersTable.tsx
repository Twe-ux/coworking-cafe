'use client'

import { useState } from 'react'
import { Edit, Trash2, MoreHorizontal, RefreshCw } from 'lucide-react'
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
import type { Supplier } from '@/types/inventory'
import { Skeleton } from '@/components/ui/skeleton'

interface SuppliersTableProps {
  suppliers: Supplier[]
  loading: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (id: string) => Promise<boolean>
  onReactivate: (id: string) => Promise<boolean>
}

export function SuppliersTable({
  suppliers,
  loading,
  onEdit,
  onDelete,
  onReactivate,
}: SuppliersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  )

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      await onDelete(supplierToDelete._id)
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  const getCategoryLabel = (category: 'food' | 'cleaning' | 'emballage' | 'papeterie' | 'divers') => {
    const labels: Record<string, string> = {
      food: 'Alimentation',
      cleaning: 'Entretien',
      emballage: 'Emballage',
      papeterie: 'Papeterie',
      divers: 'Divers'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Aucun fournisseur trouvé</p>
        <p className="text-sm mt-2">
          Commencez par créer un nouveau fournisseur
        </p>
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
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Catégories</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier._id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {supplier.email}
                </TableCell>
                <TableCell className="text-sm">{supplier.phone}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {supplier.categories.map((category) => (
                      <Badge key={category} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {getCategoryLabel(category)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={supplier.isActive ? 'default' : 'destructive'}
                  >
                    {supplier.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
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
                      <DropdownMenuItem
                        onClick={() => onEdit(supplier)}
                        className="cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      {supplier.isActive ? (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(supplier)}
                          className="text-destructive cursor-pointer hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Désactiver
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onReactivate(supplier._id)}
                          className="text-green-600 cursor-pointer hover:bg-green-50"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Réactiver
                        </DropdownMenuItem>
                      )}
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
            <AlertDialogTitle>Désactiver le fournisseur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir désactiver{' '}
              <strong>{supplierToDelete?.name}</strong> ?
              <br />
              <span className="text-muted-foreground text-sm mt-2 block">
                Le fournisseur sera masqué mais ses produits et commandes resteront intacts.
                Vous pourrez le réactiver plus tard si nécessaire.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Désactiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
