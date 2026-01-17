import { useState, useEffect, useCallback } from "react";
import type {
  MenuCategory,
  MenuItem,
  MenuItemType,
  MenuCategoryFormData,
  MenuItemFormData,
  ApiResponse,
} from "@/types/menu";

interface UseMenuManagerOptions {
  type?: MenuItemType; // Filtrer par type (food | drink)
  categoryId?: string; // Filtrer items par catégorie
  activeOnly?: boolean; // Récupérer uniquement les actifs
}

interface UseMenuManagerReturn {
  // Data
  categories: MenuCategory[];
  items: MenuItem[];
  loading: boolean;
  error: string | null;

  // Categories actions
  createCategory: (data: MenuCategoryFormData & { type: MenuItemType }) => Promise<boolean>;
  updateCategory: (id: string, data: Partial<MenuCategoryFormData>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Items actions
  createItem: (data: MenuItemFormData) => Promise<boolean>;
  updateItem: (id: string, data: Partial<MenuItemFormData>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;

  // Utility
  refetch: () => Promise<void>;
  getCategoryById: (id: string) => MenuCategory | undefined;
  getItemById: (id: string) => MenuItem | undefined;
}

/**
 * Hook pour gérer le menu (catégories + items)
 *
 * @param options - Options de filtrage
 * @returns État et actions pour gérer le menu
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
export function useMenuManager(
  options: UseMenuManagerOptions = {}
): UseMenuManagerReturn {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
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

      const response = await fetch(`/api/menu?${params}`);
      const data: ApiResponse<{ categories: MenuCategory[]; items: MenuItem[] }> =
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
    async (data: MenuCategoryFormData & { type: MenuItemType }): Promise<boolean> => {
      try {
        const response = await fetch("/api/menu/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<MenuCategory> = await response.json();

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
    async (id: string, data: Partial<MenuCategoryFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/menu/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<MenuCategory> = await response.json();

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
        const response = await fetch(`/api/menu/categories/${id}`, {
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
    async (data: MenuItemFormData): Promise<boolean> => {
      try {
        const response = await fetch("/api/menu/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<MenuItem> = await response.json();

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
    async (id: string, data: Partial<MenuItemFormData>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/menu/items/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<MenuItem> = await response.json();

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
        const response = await fetch(`/api/menu/items/${id}`, {
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
    (id: string): MenuCategory | undefined => {
      return categories.find((cat) => cat.id === id);
    },
    [categories]
  );

  const getItemById = useCallback(
    (id: string): MenuItem | undefined => {
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
