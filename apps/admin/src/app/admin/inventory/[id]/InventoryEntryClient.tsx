'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useInventoryEntry } from '@/hooks/inventory/useInventoryEntry'
import { useProducts } from '@/hooks/inventory/useProducts'
import { useInventoryValorization } from '@/hooks/inventory/useInventoryValorization'
import { InventoryEntryHeader } from '@/components/inventory/entries/InventoryEntryHeader'
import { InventorySupplierSection } from '@/components/inventory/entries/InventorySupplierSection'
import { InventoryValorizationCard } from '@/components/inventory/entries/InventoryValorizationCard'
import { CategoryFilter, SearchFilter } from '@/components/inventory/entries/filters'
import type { ProductCategory, InventoryEntryItem } from '@/types/inventory'

interface EnrichedItem extends InventoryEntryItem {
  category?: ProductCategory
  supplierId?: string
  supplierName?: string
}

export default function InventoryEntryClient({ id }: { id: string }) {
  const router = useRouter()
  const {
    entry, loading: entryLoading, error, finalizing, unfinalizing,
    handleQuantityChange, updateMetadata, finalize, unfinalize,
  } = useInventoryEntry(id)
  const { products, loading: productsLoading } = useProducts()
  const { valorization, loading: valorizationLoading } = useInventoryValorization(
    entry?.status === 'finalized' ? id : null
  )

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false)
  const [unfinalizeDialogOpen, setUnfinalizeDialogOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleSupplier = useCallback((supplierId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(supplierId)) next.delete(supplierId)
      else next.add(supplierId)
      return next
    })
  }, [])

  const productsMap = useMemo(() => new Map(products.map((p) => [p._id, p])), [products])

  const enrichedItems = useMemo<EnrichedItem[]>(() => {
    if (!entry) return []
    return entry.items.map((item) => {
      const product = productsMap.get(item.productId)
      return {
        ...item,
        category: product?.category,
        supplierId: product?.supplierId,
        supplierName: product?.supplierName,
      }
    })
  }, [entry, productsMap])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of enrichedItems) {
      counts[item.category || 'divers'] = (counts[item.category || 'divers'] || 0) + 1
    }
    return counts
  }, [enrichedItems])

  // Filter items then group by supplier
  const supplierGroups = useMemo(() => {
    let items = enrichedItems
    if (selectedCategory !== 'all') items = items.filter((i) => i.category === selectedCategory)
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((i) => i.productName.toLowerCase().includes(q))
    }
    const groups = new Map<string, { supplierName: string; items: EnrichedItem[] }>()
    for (const item of items) {
      const sId = item.supplierId || 'unknown'
      const sName = item.supplierName || 'Sans fournisseur'
      if (!groups.has(sId)) groups.set(sId, { supplierName: sName, items: [] })
      groups.get(sId)!.items.push(item)
    }
    return Array.from(groups.entries())
      .sort(([, a], [, b]) => a.supplierName.localeCompare(b.supplierName))
  }, [enrichedItems, selectedCategory, search])

  const handleFinalize = async () => {
    const success = await finalize()
    if (success) setFinalizeDialogOpen(false)
  }

  const handleUnfinalize = async () => {
    const success = await unfinalize()
    if (success) setUnfinalizeDialogOpen(false)
  }

  const isDraft = entry?.status === 'draft'

  if (entryLoading || productsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-destructive">{error || 'Inventaire introuvable'}</p>
        <Button
          variant="outline"
          className="mt-4 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={() => router.push('/admin/inventory/entries')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <InventoryEntryHeader
        entry={entry}
        finalizing={finalizing}
        unfinalizing={unfinalizing}
        onBack={() => router.push('/admin/inventory/entries')}
        onUpdateTitle={(title) => updateMetadata({ title })}
        onFinalize={() => setFinalizeDialogOpen(true)}
        onUnfinalize={() => setUnfinalizeDialogOpen(true)}
        valorization={valorization}
      />

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Valorization (only for finalized inventories) */}
      {!isDraft && valorization && (
        <InventoryValorizationCard
          stockFinalValue={valorization.stockFinalValue}
          consumptionValue={valorization.consumptionValue}
          totalValue={valorization.totalValue}
          loading={valorizationLoading}
        />
      )}

      <CategoryFilter
        categoryCounts={categoryCounts}
        totalCount={enrichedItems.length}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <SearchFilter search={search} onSearchChange={setSearch} />

      {supplierGroups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun produit ne correspond aux filtres sélectionnés
        </div>
      ) : (
        <div className="space-y-3">
          {supplierGroups.map(([supplierId, { supplierName, items }]) => (
            <InventorySupplierSection
              key={supplierId}
              supplierName={supplierName}
              items={items}
              productsMap={productsMap}
              isExpanded={expanded.has(supplierId)}
              onToggle={() => toggleSupplier(supplierId)}
              isFinalized={!isDraft}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>
      )}

      <AlertDialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser l&apos;inventaire</AlertDialogTitle>
            <AlertDialogDescription>
              Une fois finalisé, l&apos;inventaire ne pourra plus être modifié.
              Les stocks seront mis à jour automatiquement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalize} disabled={finalizing}>
              {finalizing ? 'Finalisation...' : 'Finaliser'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unfinalizeDialogOpen} onOpenChange={setUnfinalizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Définaliser l&apos;inventaire</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action annulera tous les effets de la finalisation :
              les ajustements de stock seront annulés, les mouvements de stock supprimés,
              et les commandes d&apos;achat auto-générées seront supprimées.
              Vous pourrez ensuite modifier les quantités et re-finaliser l&apos;inventaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnfinalize} disabled={unfinalizing}>
              {unfinalizing ? 'Définalisation...' : 'Définaliser'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
