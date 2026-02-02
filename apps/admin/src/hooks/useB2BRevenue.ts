import { useState, useEffect, useCallback } from "react";
import type { B2BRevenue, B2BRevenueFormData, B2BRevenueRow } from "@/types/accounting";

interface UseB2BRevenueOptions {
  startDate?: string;
  endDate?: string;
}

interface UseB2BRevenueReturn {
  data: B2BRevenueRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEntry: (formData: B2BRevenueFormData) => Promise<{ success: boolean; error?: string }>;
  updateEntry: (id: string, formData: Partial<B2BRevenueFormData>) => Promise<{ success: boolean; error?: string }>;
  deleteEntry: (id: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook pour gérer les entrées CA B2B
 * Fournit fetch, create, update, delete
 */
export function useB2BRevenue(options: UseB2BRevenueOptions = {}): UseB2BRevenueReturn {
  const [data, setData] = useState<B2BRevenueRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate) params.set("startDate", options.startDate);
      if (options.endDate) params.set("endDate", options.endDate);

      const response = await fetch(`/api/accounting/b2b-revenue?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch B2B revenue");
      }

      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createEntry = useCallback(async (formData: B2BRevenueFormData) => {
    try {
      const response = await fetch("/api/accounting/b2b-revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          ht: Number(formData.ht),
          ttc: Number(formData.ttc),
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [fetchData]);

  const updateEntry = useCallback(async (id: string, formData: Partial<B2BRevenueFormData>) => {
    try {
      const updateData: any = {};
      if (formData.date !== undefined) updateData.date = formData.date;
      if (formData.ht !== undefined) updateData.ht = Number(formData.ht);
      if (formData.ttc !== undefined) updateData.ttc = Number(formData.ttc);
      if (formData.notes !== undefined) updateData.notes = formData.notes;

      const response = await fetch(`/api/accounting/b2b-revenue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [fetchData]);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/accounting/b2b-revenue/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
