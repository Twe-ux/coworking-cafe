import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

async function fetchTasksFromAPI(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.createdBy) params.set('createdBy', filters.createdBy);

  const response = await fetch(`/api/tasks?${params}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(errorData.error || `Erreur ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Erreur inconnue');
  }

  return data.data || [];
}

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const queryClient = useQueryClient();
  const syncTriggered = useRef(false);

  // Sync recurring tasks once per page load
  if (!syncDone && !syncTriggered.current) {
    syncTriggered.current = true;
    syncDone = true;
    fetch('/api/tasks/recurring/sync', { method: 'POST' }).catch(() => {
      // Sync failure is non-blocking
    });
  }

  const queryKey = ['tasks', filters?.status, filters?.priority, filters?.createdBy];

  const { data, isLoading, error: queryError } = useQuery({
    queryKey,
    queryFn: () => fetchTasksFromAPI(filters),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  const createMutation = useMutation({
    mutationFn: async (createData: TaskCreateData): Promise<Task> => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: string; updateData: TaskUpdateData }): Promise<Task> => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createTask = async (createData: TaskCreateData): Promise<Task | null> => {
    try {
      return await createMutation.mutateAsync(createData);
    } catch {
      return null;
    }
  };

  const updateTask = async (id: string, updateData: TaskUpdateData): Promise<Task | null> => {
    try {
      return await updateMutation.mutateAsync({ id, updateData });
    } catch {
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const toggleTaskStatus = async (task: Task): Promise<Task | null> => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    return updateTask(task.id, { status: newStatus });
  };

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKey });
  };

  // Derive error string from query or mutation errors
  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error;
  const activeError = queryError || mutationError;
  const errorMessage = activeError instanceof Error ? activeError.message : null;

  return {
    tasks: data ?? [],
    loading: isLoading,
    error: errorMessage,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  };
}
