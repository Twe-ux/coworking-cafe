'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryHistory } from '@/components/inventory/entries'
import { useInventoryEntries } from '@/hooks/inventory/useInventoryEntries'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function InventoryEntriesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'weekly' | 'monthly'>('all')

  const { entries, loading, deleteEntry } = useInventoryEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const handleView = (entry: { _id: string }) => {
    router.push(`/admin/inventory/${entry._id}`)
  }

  const handleDelete = async (id: string): Promise<boolean> => {
    const success = await deleteEntry(id)
    return success
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventaires</h1>
          <p className="text-muted-foreground mt-1">
            Historique des saisies d'inventaires hebdomadaires et mensuels
          </p>
        </div>
        <Button onClick={() => router.push('/admin/inventory/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel inventaire
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="finalized">Finalisés</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="weekly">Hebdomadaires</SelectItem>
            <SelectItem value="monthly">Mensuels</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History Table */}
      <InventoryHistory
        entries={entries}
        loading={loading}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  )
}
