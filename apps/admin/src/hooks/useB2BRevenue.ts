import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { B2BRevenue, CreateB2BRevenueInput } from '@/types/accounting';

/**
 * Hook pour récupérer la liste filtrée des factures B2B
 */
export function useB2BRevenueList(year: number, month: number) {
  const monthPadded = String(month).padStart(2, '0');
  const startDate = `${year}-${monthPadded}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${monthPadded}-${String(lastDay).padStart(2, '0')}`;

  return useQuery({
    queryKey: ['b2b-revenues', 'list', year, month],
    queryFn: async () => {
      const res = await fetch(`/api/accounting/b2b-revenue?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error('Failed to fetch B2B revenues');
      const result = await res.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
}

export function useB2BRevenue() {
  const queryClient = useQueryClient();

  const { data: revenues, isLoading } = useQuery<B2BRevenue[]>({
    queryKey: ['b2b-revenues'],
    queryFn: async () => {
      const res = await fetch('/api/accounting/b2b-revenue');
      if (!res.ok) throw new Error('Failed to fetch B2B revenues');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateB2BRevenueInput) => {
      const res = await fetch('/api/accounting/b2b-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create B2B revenue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-combined'] });
      toast.success('CA B2B ajouté avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'ajout du CA B2B');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateB2BRevenueInput> }) => {
      const res = await fetch(`/api/accounting/b2b-revenue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update B2B revenue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-combined'] });
      toast.success('CA B2B mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du CA B2B');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/accounting/b2b-revenue/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete B2B revenue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-revenues'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-combined'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-combined'] });
      toast.success('CA B2B supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression du CA B2B');
    },
  });

  return {
    revenues: revenues || [],
    isLoading,
    createRevenue: createMutation.mutate,
    updateRevenue: updateMutation.mutate,
    deleteRevenue: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
