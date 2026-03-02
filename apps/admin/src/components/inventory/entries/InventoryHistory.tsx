'use client'

import { useState } from 'react'
import { Eye, Trash2, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { InventoryEntry } from '@/types/inventory'

interface InventoryHistoryProps {
  entries: InventoryEntry[]
  loading: boolean
  onView: (entry: InventoryEntry) => void
  onDelete: (id: string) => Promise<boolean>
}

export function InventoryHistory({
  entries, loading, onView, onDelete,
}: InventoryHistoryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<InventoryEntry | null>(null)

  const handleDeleteClick = (entry: InventoryEntry) => {
    setEntryToDelete(entry)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (entryToDelete) {
      await onDelete(entryToDelete._id)
      setDeleteDialogOpen(false)
      setEntryToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Aucun inventaire trouve</p>
        <p className="text-sm mt-2">Commencez par creer un nouvel inventaire</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Produits</TableHead>
              <TableHead className="text-right">Ecart total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell className="font-medium">{entry.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {entry.type === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {entry.items.length}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={entry.totalVarianceValue < 0
                    ? 'text-destructive'
                    : entry.totalVarianceValue > 0
                      ? 'text-green-600'
                      : ''
                  }>
                    {entry.totalVarianceValue.toFixed(2)} EUR
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={entry.status === 'finalized' ? 'default' : 'outline'}>
                    {entry.status === 'finalized' ? 'Finalise' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(entry)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {entry.status === 'draft' ? 'Continuer' : 'Voir detail'}
                      </DropdownMenuItem>
                      {entry.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(entry)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;inventaire</AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer l&apos;inventaire brouillon du{' '}
              <strong>{entryToDelete?.date}</strong> ?
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
