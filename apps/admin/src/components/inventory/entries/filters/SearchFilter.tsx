'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchFilterProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
}

export function SearchFilter({
  search,
  onSearchChange,
  placeholder = 'Rechercher par nom...',
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(search)

  // Sync with external changes
  useEffect(() => {
    setLocalValue(search)
  }, [search])

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== search) {
        onSearchChange(localValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localValue, search, onSearchChange])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
