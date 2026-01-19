import { useState, useEffect, useCallback } from "react";
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
 * } = useMenuManager({ type: "food" });
 * ```
 */
export function useProduitsManager(
  options: UseProduitsManagerOptions = {}
): UseProduitsManagerReturn {
  const [categories, setCategories] = useState<ProduitsCategory[]>([]);
  const [items, setItems] = useState<ProduitsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // FETCH DATA
  // ========================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.type) params.set("type", options.type);
      if (options.activeOnly) params.set("activeOnly", "true");

      const response = await fetch(`/api/produits?${params}`);
      const data: ApiResponse<{ categories: ProduitsCategory[]; items: ProduitsItem[] }> =
        await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération des données");
      }

      if (data.data) {
        setCategories(data.data.categories || []);

        // Filtrer items par categoryId si spécifié
        const filteredItems = options.categoryId
          ? (data.data.items || []).filter(
              (item) => item.category.id === options.categoryId
            )
          : data.data.items || [];

        setItems(filteredItems);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [options.type, options.categoryId, options.activeOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ========================================
  // CATEGORIES ACTIONS
  // ========================================

  const createCategory = useCallback(
    async (data: ProduitsCategoryFormData & { type: ProduitsItemType }): Promise<boolean> => {
      try {
        const response = await fetch("/api/produits/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<ProduitsCategory> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la création");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<ProduitsCategoryFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/produits/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<ProduitsCategory> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la mise à jour");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/produits/categories/${id}`, {
          method: "DELETE",
        });

        const result: ApiResponse<void> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la suppression");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  // ========================================
  // ITEMS ACTIONS
  // ========================================

  const createItem = useCallback(
    async (data: ProduitsItemFormData): Promise<boolean> => {
      try {
        const response = await fetch("/api/produits/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<ProduitsItem> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la création");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<ProduitsItemFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/produits/items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<ProduitsItem> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la mise à jour");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/produits/items/${id}`, {
          method: "DELETE",
        });

        const result: ApiResponse<void> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la suppression");
        }

        // Rafraîchir les données
        await fetchData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        return false;
      }
    },
    [fetchData]
  );

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const getCategoryById = useCallback(
    (id: string): ProduitsCategory | undefined => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  const getItemById = useCallback(
    (id: string): ProduitsItem | undefined => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  return {
    // Data
    categories,
    items,
    loading,
    error,

    // Categories actions
    createCategory,
    updateCategory,
    deleteCategory,

    // Items actions
    createItem,
    updateItem,
    deleteItem,

    // Utility
    refetch: fetchData,
    getCategoryById,
    getItemById,
  };
}
