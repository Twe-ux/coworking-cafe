import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Task,
  TaskCreateData,
  TaskUpdateData,
  TaskFilters,
} from '@/types/task';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTask: (data: TaskCreateData) => Promise<Task | null>;
  updateTask: (id: string, data: TaskUpdateData) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (task: Task) => Promise<Task | null>;
}

// Sync recurring tasks once per page load (shared across hook instances)
let syncDone = false;

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncTriggered = useRef(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.createdBy) params.set('createdBy', filters.createdBy);

      const response = await fetch(`/api/tasks?${params}`);

      // Vérifier le status HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur inconnue');
      }

      setTasks(data.data || []);
    } catch (err) {
      console.error('useTasks fetchTasks error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.priority, filters?.createdBy]);

  useEffect(() => {
    const init = async () => {
      // Sync recurring tasks once per page load
      if (!syncDone && !syncTriggered.current) {
        syncTriggered.current = true;
        syncDone = true;
        try {
          await fetch('/api/tasks/recurring/sync', { method: 'POST' });
        } catch {
          // Sync failure is non-blocking
        }
      }
      await fetchTasks();
    };
    init();
  }, [fetchTasks]);

  const createTask = async (data: TaskCreateData): Promise<Task | null> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      // Rafraîchir la liste
      await fetchTasks();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  const updateTask = async (
    id: string,
    data: TaskUpdateData
  ): Promise<Task | null> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      // Rafraîchir la liste
      await fetchTasks();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }

      // Rafraîchir la liste
      await fetchTasks();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  const toggleTaskStatus = async (task: Task): Promise<Task | null> => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    return updateTask(task.id, { status: newStatus });
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
}
