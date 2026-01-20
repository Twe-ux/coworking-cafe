import { useState, useEffect, useCallback } from "react"
import type { Comment, CommentStatus } from "@/types/blog"

interface UseCommentsOptions {
  status?: CommentStatus | "all"
  articleId?: string
  page?: number
  limit?: number
}

interface UseCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  total: number
  pages: number
  currentPage: number
  refetch: () => Promise<void>
  updateComment: (
    id: string,
    data: { status?: CommentStatus; content?: string }
  ) => Promise<Comment | null>
  deleteComment: (id: string) => Promise<boolean>
}

export function useComments(options: UseCommentsOptions = {}): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(options.page || 1)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.page) params.set("page", options.page.toString())
      if (options.limit) params.set("limit", options.limit.toString())
      if (options.status && options.status !== "all") params.set("status", options.status)
      if (options.articleId) params.set("articleId", options.articleId)

      const response = await fetch(`/api/blog/comments?${params}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur inconnue")
      }

      setComments(data.data.comments || [])
      setTotal(data.data.total || 0)
      setPages(data.data.pages || 0)
      setCurrentPage(data.data.page || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }, [options.page, options.limit, options.status, options.articleId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const updateComment = useCallback(
    async (
      id: string,
      data: { status?: CommentStatus; content?: string }
    ): Promise<Comment | null> => {
      try {
        const response = await fetch(`/api/blog/comments/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la mise à jour du commentaire")
        }

        await fetchComments()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return null
      }
    },
    [fetchComments]
  )

  const deleteComment = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/blog/comments/${id}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Erreur lors de la suppression du commentaire")
        }

        await fetchComments()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue")
        return false
      }
    },
    [fetchComments]
  )

  return {
    comments,
    loading,
    error,
    total,
    pages,
    currentPage,
    refetch: fetchComments,
    updateComment,
    deleteComment,
  }
}
