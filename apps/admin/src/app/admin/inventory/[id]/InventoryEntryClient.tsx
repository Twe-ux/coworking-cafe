'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryEntry } from '@/hooks/inventory/useInventoryEntry'
import { ProductInventoryRow, InventorySummary } from '@/components/inventory/entries'

export default function InventoryEntryClient({ id }: { id: string }) {
  const router = useRouter()
  const {
    entry, loading, error, saving, finalizing,
    handleQuantityChange, saveAll, finalize,
  } = useInventoryEntry(id)
  const [search, setSearch] = useState('')
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false)

  const handleFinalize = async () => {
    const success = await finalize()
    if (success) {
      setFinalizeDialogOpen(false)
      router.push('/admin/inventory')
    }
  }

  if (loading) return (
    <div className="container mx-auto p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  if (!entry) return (
    <div className="container mx-auto p-6">
      <p className="text-destructive">{error || 'Inventaire introuvable'}</p>
      <Button variant="ghost" onClick={() => router.push('/admin/inventory')} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
    </div>
  )

  const isFinalized = entry.status === 'finalized'
  const filteredItems = entry.items.filter((item) =>
    item.productName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/inventory')} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <h1 className="text-2xl font-bold">Inventaire du {entry.date}</h1>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary">
              {entry.type === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
            </Badge>
            <Badge variant={isFinalized ? 'default' : 'outline'}>
              {isFinalized ? 'Finalise' : 'Brouillon'}
            </Badge>
          </div>
        </div>
        {!isFinalized && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveAll} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button onClick={() => setFinalizeDialogOpen(true)} disabled={finalizing}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Finaliser
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-3 py-2 rounded text-sm">{error}</div>
      )}

      <InventorySummary items={entry.items} totalVarianceValue={entry.totalVarianceValue} />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un produit..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Items table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-center">Qte theorique</TableHead>
              <TableHead className="text-center">Qte reelle</TableHead>
              <TableHead className="text-center">Ecart</TableHead>
              <TableHead className="text-right">Valeur ecart</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <ProductInventoryRow key={item.productId} item={item}
                isFinalized={isFinalized} onQuantityChange={handleQuantityChange} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Finalize Dialog */}
      <AlertDialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser l&apos;inventaire</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va mettre a jour le stock de tous les produits avec les
              ecarts constates. Cette operation est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? 'Finalisation...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
