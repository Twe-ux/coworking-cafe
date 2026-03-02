import { useState, useEffect, useCallback } from 'react'
import type { InventoryPendingTask } from '@/types/inventory'

interface UseInventoryTasksReturn {
  pendingTasks: InventoryPendingTask[]
  loading: boolean
  setupTemplates: () => Promise<boolean>
  checkLowStock: () => Promise<number>
  completeTask: (taskId: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useInventoryTasks(): UseInventoryTasksReturn {
  const [pendingTasks, setPendingTasks] = useState<InventoryPendingTask[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/inventory/tasks/pending')
      const data = await res.json()
      if (data.success) {
        setPendingTasks(data.data || [])
      }
    } catch (err) {
      console.error('useInventoryTasks fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setupTemplates = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/tasks/setup', { method: 'POST' })
      const data = await res.json()
      return data.success
    } catch {
      return false
    }
  }

  const checkLowStock = async (): Promise<number> => {
    try {
      const res = await fetch('/api/inventory/tasks/check-low-stock', {
        method: 'POST',
      })
      const data = await res.json()
      return data.success ? data.data.tasksCreated : 0
    } catch {
      return 0
    }
  }

  const completeTask = async (taskId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/tasks/${taskId}/complete`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.success) {
        await fetchPending()
      }
      return data.success
    } catch {
      return false
    }
  }

  return {
    pendingTasks,
    loading,
    setupTemplates,
    checkLowStock,
    completeTask,
    refetch: fetchPending,
  }
}
