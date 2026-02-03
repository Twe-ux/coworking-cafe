import { useState, useEffect, useCallback } from "react";
import type { User, UserFilters } from "@/types/user";

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteUser: (userId: string) => Promise<boolean>;
}

/**
 * Hook pour récupérer et gérer la liste des utilisateurs
 *
 * @param filters - Filtres optionnels (search, roleSlug, isActive, newsletter)
 * @returns { users, loading, error, refetch }
 */
export function useUsers(filters?: UserFilters): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();

      if (filters?.search) {
        params.set("search", filters.search);
      }

      if (filters?.roleSlug && filters.roleSlug !== "all") {
        params.set("roleSlug", filters.roleSlug);
      }

      if (filters?.isActive !== undefined) {
        params.set("isActive", filters.isActive.toString());
      }

      if (filters?.newsletter !== undefined) {
        params.set("newsletter", filters.newsletter.toString());
      }

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la récupération des utilisateurs");
      }

      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.error("useUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.roleSlug, filters?.isActive, filters?.newsletter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Refetch users after successful deletion
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      return false;
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    deleteUser,
  };
}
