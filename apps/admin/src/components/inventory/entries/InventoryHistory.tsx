'use client'

import { useState, useMemo } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
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

  // Sort entries and calculate reference periods
  const sortedEntries = useMemo(() => {
    // Sort for display: date DESC, then createdAt ASC (oldest first if same date)
    const displaySorted = [...entries].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateCompare !== 0) return dateCompare
      // Same date: oldest first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    // Sort chronologically (oldest first) to determine reference periods
    const chronological = [...entries].sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    return displaySorted.map((entry) => {
      // Find position in chronological order
      const chronoIndex = chronological.findIndex(e => e._id === entry._id)

      if (chronoIndex === 0) {
        // First inventory chronologically
        return { ...entry, referencePeriod: 'Premier inventaire' }
      }

      // Get previous entry in chronological order
      const prevEntry = chronological[chronoIndex - 1]
      return {
        ...entry,
        referencePeriod: `${prevEntry.date} → ${entry.date}`
      }
    })
  }, [entries])

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
              <TableHead>Mois</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date de reference</TableHead>
              <TableHead className="text-right">Ecart total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.map((entry) => {
              const monthYear = new Date(entry.date).toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
              })
              const formattedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

              return (
              <TableRow key={entry._id}>
                <TableCell className="font-medium">{formattedMonth}</TableCell>
                <TableCell>
                  {entry.title || `Inventaire du ${entry.date}`}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs pointer-events-none ${
                      entry.type === 'monthly'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-purple-500 bg-purple-50 text-purple-700'
                    }`}
                  >
                    {entry.type === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {entry.referencePeriod}
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
                  <Badge
                    variant="outline"
                    className={`text-xs pointer-events-none ${
                      entry.status === 'finalized'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {entry.status === 'finalized' ? 'Finalise' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
                      onClick={() => onView(entry)}
                      title={entry.status === 'draft' ? 'Continuer' : 'Voir detail'}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {entry.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDeleteClick(entry)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              )
            })}
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
