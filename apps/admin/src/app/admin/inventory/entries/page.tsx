'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryHistory } from '@/components/inventory/entries'
import { useInventoryEntries } from '@/hooks/inventory/useInventoryEntries'
import { createInventoryAuto } from '@/lib/inventory/createInventoryAuto'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Generate list of last 3 years
function generateYearOptions() {
  const options = []
  const currentYear = new Date().getFullYear()

  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    options.push({ value: year.toString(), label: year.toString() })
  }

  return options
}

export default function InventoryEntriesPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'finalized'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'weekly' | 'monthly'>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [creating, setCreating] = useState(false)

  const yearOptions = useMemo(() => generateYearOptions(), [])

  // Calculate date range from year filter
  const dateRange = useMemo(() => {
    if (yearFilter === 'all') return {}

    const year = parseInt(yearFilter, 10)
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31) // December 31st

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }, [yearFilter])

  const { entries, loading, deleteEntry, unfinalizeEntry, refetch } = useInventoryEntries({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    ...dateRange,
  })

  const handleView = (entry: { _id: string }) => {
    router.push(`/admin/inventory/${entry._id}`)
  }

  const handleDelete = async (id: string): Promise<boolean> => {
    const success = await deleteEntry(id)
    return success
  }

  const handleUnfinalize = async (id: string): Promise<boolean> => {
    const success = await unfinalizeEntry(id)
    if (success) {
      await refetch()
    }
    return success
  }

  const handleCreate = async () => {
    setCreating(true)
    const result = await createInventoryAuto({ type: 'monthly' })
    if (result.success) {
      router.push(`/admin/inventory/${result.inventoryId}`)
    } else {
      alert(result.error)
      setCreating(false)
    }
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
        <Button
          variant="outline"
          size="lg"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Plus className="mr-2 h-5 w-5" />
          )}
          {creating ? 'Création...' : 'Nouvel inventaire'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les années</SelectItem>
            {yearOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        onUnfinalize={handleUnfinalize}
      />
    </div>
  )
}
