import { useState, useEffect, useCallback } from "react"
import type { Category } from "@/types/blog"

interface UseCategoriesOptions {
  includeInactive?: boolean
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (data: {
    name: string
    description?: string
    parentId?: string
    color?: string
  }) => Promise<Category | null>
  updateCategory: (
    id: string,
    data: {
      name?: string
      description?: string
      parentId?: string
      color?: string
      isActive?: boolean
    }
  ) => Promise<Category | null>
  deleteCategory: (id: string) => Promise<boolean>
}

export function useCategories(
  options: UseCategoriesOptions = {}
): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.includeInactive) params.set("includeInactive", "true")

      const response = await fetch(`/api/blog/categories?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur inconnue")
      }

      setCategories(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [options.includeInactive])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = useCallback(
    async (data: {
      name: string
      description?: string
      parentId?: string
      color?: string
    }): Promise<Category | null> => {
      try {
        const response = await fetch("/api/blog/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la création de la catégorie")
        }

        await fetchCategories()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return null
      }
    },
    [fetchCategories]
  )

  const updateCategory = useCallback(
    async (
      id: string,
      data: {
        name?: string
        description?: string
        parentId?: string
        color?: string
        isActive?: boolean
      }
    ): Promise<Category | null> => {
      try {
        const response = await fetch(`/api/blog/categories/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(
            result.error || "Erreur lors de la mise à jour de la catégorie"
          )
        }

        await fetchCategories()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return null
      }
    },
    [fetchCategories]
  )

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/blog/categories/${id}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(
            result.error || "Erreur lors de la suppression de la catégorie"
          )
        }

        await fetchCategories()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [fetchCategories]
  )

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
