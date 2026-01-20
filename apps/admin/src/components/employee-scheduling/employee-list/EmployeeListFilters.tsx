import React from 'react'
import { Input } from '@/components/ui/input'
import { Search, Users, Calendar } from 'lucide-react'
import { EMPLOYEE_ROLES } from './utils'
import type { ViewMode, EmployeeRole } from './types'

interface EmployeeListFiltersProps {
  searchTerm: string
  selectedRole: EmployeeRole
  viewMode: ViewMode
  onSearchChange: (term: string) => void
  onRoleChange: (role: EmployeeRole) => void
  onViewModeChange: (mode: ViewMode) => void
}

export function EmployeeListFilters({
  searchTerm,
  selectedRole,
  viewMode,
  onSearchChange,
  onRoleChange,
  onViewModeChange,
}: EmployeeListFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <select
        value={selectedRole}
        onChange={(e) => onRoleChange(e.target.value as EmployeeRole)}
        className="focus:ring-coffee-primary rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
      >
        {EMPLOYEE_ROLES.map((role) => (
          <option key={role} value={role}>
            {role === 'all' ? 'Tous les rôles' : role}
          </option>
        ))}
      </select>

      <div className="flex rounded-lg border border-gray-300">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 transition-colors ${
            viewMode === 'grid'
              ? 'bg-coffee-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="h-4 w-4" />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 transition-colors ${
            viewMode === 'list'
              ? 'bg-coffee-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
