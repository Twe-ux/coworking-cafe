'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SupplierOption {
  id: string
  name: string
}

interface SupplierFilterProps {
  suppliers: SupplierOption[]
  selectedSupplier: string
  onSupplierChange: (supplierId: string) => void
}

export function SupplierFilter({
  suppliers,
  selectedSupplier,
  onSupplierChange,
}: SupplierFilterProps) {
  return (
    <Select value={selectedSupplier} onValueChange={onSupplierChange}>
      <SelectTrigger className="w-full md:w-[220px]">
        <SelectValue placeholder="Fournisseur" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les fournisseurs</SelectItem>
        {suppliers.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
