import { useState, useEffect, useCallback } from "react"
import type {
  Article,
  ArticleStatus,
  ArticlesFilter,
  CreateArticleData,
  UpdateArticleData,
} from "@/types/blog"

interface UseArticlesOptions {
  status?: ArticleStatus | "all"
  category?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface UseArticlesReturn {
  articles: Article[]
  loading: boolean
  error: string | null
  total: number
  pages: number
  currentPage: number
  refetch: () => Promise<void>
  createArticle: (data: CreateArticleData) => Promise<Article | null>
  updateArticle: (id: string, data: UpdateArticleData) => Promise<Article | null>
  deleteArticle: (id: string) => Promise<boolean>
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(options.page || 1)

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.page) params.set("page", options.page.toString())
      if (options.limit) params.set("limit", options.limit.toString())
      if (options.status && options.status !== "all") params.set("status", options.status)
      if (options.category) params.set("category", options.category)
      if (options.search) params.set("search", options.search)
      if (options.sortBy) params.set("sortBy", options.sortBy)
      if (options.sortOrder) params.set("sortOrder", options.sortOrder)

      const response = await fetch(`/api/blog/articles?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur inconnue")
      }

      setArticles(data.data.articles || [])
      setTotal(data.data.total || 0)
      setPages(data.data.pages || 0)
      setCurrentPage(data.data.page || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [
    options.page,
    options.limit,
    options.status,
    options.category,
    options.search,
    options.sortBy,
    options.sortOrder,
  ])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const createArticle = useCallback(
    async (data: CreateArticleData): Promise<Article | null> => {
      try {
        const response = await fetch("/api/blog/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la création de l'article")
        }

        await fetchArticles()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return null
      }
    },
    [fetchArticles]
  )

  const updateArticle = useCallback(
    async (id: string, data: UpdateArticleData): Promise<Article | null> => {
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la mise à jour de l'article")
        }

        await fetchArticles()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return null
      }
    },
    [fetchArticles]
  )

  const deleteArticle = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la suppression de l'article")
        }

        await fetchArticles()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [fetchArticles]
  )

  return {
    articles,
    loading,
    error,
    total,
    pages,
    currentPage,
    refetch: fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  }
}
