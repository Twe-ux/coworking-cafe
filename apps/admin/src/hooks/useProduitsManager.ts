import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ProduitsCategory,
  ProduitsItem,
  ProduitsItemType,
  ProduitsCategoryFormData,
  ProduitsItemFormData,
  ApiResponse,
} from "@/types/produits";

interface UseProduitsManagerOptions {
  type?: ProduitsItemType; // Filtrer par type (food | drink)
  categoryId?: string; // Filtrer items par catégorie
  activeOnly?: boolean; // Récupérer uniquement les actifs
}

interface UseProduitsManagerReturn {
  // Data
  categories: ProduitsCategory[];
  items: ProduitsItem[];
  loading: boolean;
  error: string | null;

  // Categories actions
  createCategory: (data: ProduitsCategoryFormData & { type: ProduitsItemType }) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<ProduitsCategoryFormData>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Items actions
  createItem: (data: ProduitsItemFormData) => Promise<boolean>;
  updateItem: (id: string, data: Partial<ProduitsItemFormData>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;

  // Utility
  refetch: () => Promise<void>;
  getCategoryById: (id: string) => ProduitsCategory | undefined;
  getItemById: (id: string) => ProduitsItem | undefined;
}

/**
 * Hook pour gérer les produits (catégories + items)
 * Utilise React Query pour le cache automatique (5min dev, 24h prod)
 *
 * @param options - Options de filtrage
 * @returns État et actions pour gérer les produits
 *
 * @example
 * ```tsx
 * const {
 *   categories,
 *   items,
 *   loading,
 *   error,
 *   createCategory,
 *   createItem,
 * } = useProduitsManager({ type: "food" });
 * ```
 */
export function useProduitsManager(
  options: UseProduitsManagerOptions = {}
): UseProduitsManagerReturn {
  const queryClient = useQueryClient();

  // ========================================
  // FETCH DATA avec React Query
  // ========================================

  const queryKey = ["produits", options];

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.type) params.set("type", options.type);
      if (options.activeOnly) params.set("activeOnly", "true");

      const response = await fetch(`/api/produits?${params}`);
      const data: ApiResponse<{ categories: ProduitsCategory[]; items: ProduitsItem[] }> =
        await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération des données");
      }

      return data.data;
    },
  });

  // Filtrer items par categoryId si spécifié
  const items = useMemo(() => {
    if (!data?.items) return [];
    if (!options.categoryId) return data.items;
    return data.items.filter((item) => item.category.id === options.categoryId);
  }, [data?.items, options.categoryId]);

  // ========================================
  // CATEGORIES MUTATIONS
  // ========================================

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: ProduitsCategoryFormData & { type: ProduitsItemType }) => {
      const response = await fetch("/api/produits/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      const result: ApiResponse<ProduitsCategory> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      categoryData,
    }: {
      id: string;
      categoryData: Partial<ProduitsCategoryFormData>;
    }) => {
      const response = await fetch(`/api/produits/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      const result: ApiResponse<ProduitsCategory> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/produits/categories/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  // ========================================
  // ITEMS MUTATIONS
  // ========================================

  const createItemMutation = useMutation({
    mutationFn: async (itemData: ProduitsItemFormData) => {
      const response = await fetch("/api/produits/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const result: ApiResponse<ProduitsItem> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la création");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      itemData,
    }: {
      id: string;
      itemData: Partial<ProduitsItemFormData>;
    }) => {
      const response = await fetch(`/api/produits/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      const result: ApiResponse<ProduitsItem> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/produits/items/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  // ========================================
  // WRAPPER FUNCTIONS
  // ========================================

  const createCategory = useCallback(
    async (categoryData: ProduitsCategoryFormData & { type: ProduitsItemType }) => {
      try {
        await createCategoryMutation.mutateAsync(categoryData);
        return true;
      } catch {
        return false;
      }
    },
    [createCategoryMutation]
  );

  const updateCategory = useCallback(
    async (id: string, categoryData: Partial<ProduitsCategoryFormData>) => {
      try {
        await updateCategoryMutation.mutateAsync({ id, categoryData });
        return true;
      } catch {
        return false;
      }
    },
    [updateCategoryMutation]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await deleteCategoryMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteCategoryMutation]
  );

  const createItem = useCallback(
    async (itemData: ProduitsItemFormData) => {
      try {
        await createItemMutation.mutateAsync(itemData);
        return true;
      } catch {
        return false;
      }
    },
    [createItemMutation]
  );

  const updateItem = useCallback(
    async (id: string, itemData: Partial<ProduitsItemFormData>) => {
      try {
        await updateItemMutation.mutateAsync({ id, itemData });
        return true;
      } catch {
        return false;
      }
    },
    [updateItemMutation]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await deleteItemMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    [deleteItemMutation]
  );

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getCategoryById = useCallback(
    (id: string): ProduitsCategory | undefined => {
      return data?.categories.find((cat) => cat.id === id);
    },
    [data?.categories]
  );

  const getItemById = useCallback(
    (id: string): ProduitsItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    // Data
    categories: data?.categories || [],
    items,
    loading: isLoading,
    error: queryError?.message || null,

    // Categories actions
    createCategory,
    updateCategory,
    deleteCategory,

    // Items actions
    createItem,
    updateItem,
    deleteItem,

    // Utility
    refetch: async () => {
      await refetch();
    },
    getCategoryById,
    getItemById,
  };
}
