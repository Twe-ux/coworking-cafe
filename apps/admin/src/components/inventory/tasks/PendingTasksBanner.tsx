'use client'

import { Bell, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { InventoryPendingTask } from '@/types/inventory'

interface PendingTasksBannerProps {
  tasks: InventoryPendingTask[]
  onStartInventory: (taskId: string, type: 'weekly' | 'monthly') => void
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-800 border-red-200',
  medium: 'bg-blue-50 text-blue-800 border-blue-200',
  low: 'bg-green-50 text-green-800 border-green-200',
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
}

export function PendingTasksBanner({
  tasks,
  onStartInventory,
}: PendingTasksBannerProps) {
  if (tasks.length === 0) return null

  // Show the highest priority task first
  const topTask = tasks[0]
  const style = PRIORITY_STYLES[topTask.priority] || PRIORITY_STYLES.medium

  return (
    <div className={`px-4 py-3 rounded-lg border ${style}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium flex items-center gap-2">
              {tasks.length} inventaire{tasks.length > 1 ? 's' : ''} planifie{tasks.length > 1 ? 's' : ''}
              <Badge variant={PRIORITY_BADGE[topTask.priority] as 'destructive' | 'secondary' | 'outline'}>
                {topTask.priority === 'high' ? 'Urgent' : topTask.priority === 'medium' ? 'Normal' : 'Faible'}
              </Badge>
            </p>
            <ul className="text-sm mt-1 space-y-1">
              {tasks.slice(0, 3).map((task) => (
                <li key={task.id} className="flex items-center gap-2">
                  <span>{task.title.replace('[Inventaire] ', '')}</span>
                  {task.dueDate && (
                    <span className="text-xs opacity-75">
                      (echeance: {task.dueDate})
                    </span>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => onStartInventory(task.id, task.inventoryType)}
                  >
                    Demarrer <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
            {tasks.length > 3 && (
              <p className="text-xs mt-1 opacity-75">
                + {tasks.length - 3} autre{tasks.length - 3 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
