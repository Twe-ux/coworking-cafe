import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { EmployeeStatistics } from './types'

interface EmployeeListStatsProps {
  statistics: EmployeeStatistics
}

export function EmployeeListStats({ statistics }: EmployeeListStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-coffee-primary text-2xl font-bold">
            {statistics.active}
          </div>
          <div className="text-sm text-gray-600">Employés actifs</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">
            {statistics.byRole.Manager || 0}
          </div>
          <div className="text-sm text-gray-600">Managers</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {statistics.byRole['Assistant manager'] || 0}
          </div>
          <div className="text-sm text-gray-600">Assistants manager</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">
            {statistics.byRole['Employé polyvalent'] || 0}
          </div>
          <div className="text-sm text-gray-600">Employés polyvalents</div>
        </CardContent>
      </Card>
    </div>
  )
}
