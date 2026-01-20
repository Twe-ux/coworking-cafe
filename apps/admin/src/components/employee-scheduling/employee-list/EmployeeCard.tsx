import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, MoreVertical, Trash2, Mail, Phone, Calendar } from 'lucide-react'
import type { Employee } from '@/hooks/useEmployees'
import type { ViewMode } from './types'

interface EmployeeCardProps {
  employee: Employee
  viewMode: ViewMode
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onSelect?: (employee: Employee) => void
}

export function EmployeeCard({
  employee,
  viewMode,
  onEdit,
  onDelete,
  onSelect,
}: EmployeeCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={() => onSelect?.(employee)}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback
                className={`${employee.color} text-lg font-semibold text-white`}
              >
                {employee.firstName.charAt(0)}
                {employee.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {employee.fullName}
              </h3>
              <Badge variant="secondary" className="mt-1">
                {employee.employeeRole}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(employee)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(employee)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {employee.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}

          {employee.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{employee.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Depuis le{' '}
              {new Date(employee.hireDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm font-medium text-green-700">
                  Actif
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
