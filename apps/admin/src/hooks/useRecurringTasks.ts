import { useState, useEffect, useCallback } from 'react';
import type {
  RecurringTask,
  RecurringTaskCreateData,
  RecurringTaskUpdateData,
} from '@/types/task';

interface UseRecurringTasksReturn {
  templates: RecurringTask[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTemplate: (data: RecurringTaskCreateData) => Promise<RecurringTask | null>;
  updateTemplate: (id: string, data: RecurringTaskUpdateData) => Promise<RecurringTask | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  syncRecurring: () => Promise<void>;
}

export function useRecurringTasks(): UseRecurringTasksReturn {
  const [templates, setTemplates] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tasks/recurring');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur reseau' }));
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Erreur inconnue');

      setTemplates(data.data || []);
    } catch (err) {
      console.error('useRecurringTasks fetchTemplates error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (data: RecurringTaskCreateData): Promise<RecurringTask | null> => {
    try {
      const response = await fetch('/api/tasks/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erreur creation');

      await fetchTemplates();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  const updateTemplate = async (
    id: string,
    data: RecurringTaskUpdateData
  ): Promise<RecurringTask | null> => {
    try {
      const response = await fetch(`/api/tasks/recurring/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erreur mise a jour');

      await fetchTemplates();
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/recurring/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erreur suppression');

      await fetchTemplates();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    }
  };

  const syncRecurring = async (): Promise<void> => {
    try {
      await fetch('/api/tasks/recurring/sync', { method: 'POST' });
    } catch (err) {
      console.error('Sync recurring tasks error:', err);
    }
  };

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    syncRecurring,
  };
}
