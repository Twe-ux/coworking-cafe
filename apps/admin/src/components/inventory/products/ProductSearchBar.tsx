'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ProductSearchBarProps {
  search: string
  onSearchChange: (value: string) => void
  activeStatus: string
  onActiveStatusChange: (value: string) => void
  lowStockOnly: boolean
  onLowStockChange: (checked: boolean) => void
}

export function ProductSearchBar({
  search, onSearchChange,
  activeStatus, onActiveStatusChange,
  lowStockOnly, onLowStockChange,
}: ProductSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
      </div>
      <Select value={activeStatus} onValueChange={onActiveStatusChange}>
        <SelectTrigger className="w-full md:w-[160px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous statuts</SelectItem>
          <SelectItem value="active">Actifs</SelectItem>
          <SelectItem value="inactive">Inactifs</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2 border rounded-md px-3 py-2">
        <Checkbox id="lowStock" checked={lowStockOnly} onCheckedChange={(v) => onLowStockChange(v === true)} />
        <label htmlFor="lowStock" className="text-sm font-medium leading-none cursor-pointer">Stock faible</label>
      </div>
    </div>
  )
}
