"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Article } from "@/types/blog"

interface DeleteArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  onSuccess: () => void
}

export function DeleteArticleDialog({
  open,
  onOpenChange,
  article,
  onSuccess,
}: DeleteArticleDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!article) return

    setLoading(true)

    try {
      const response = await fetch(`/api/blog/articles/${article._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting article:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'article "
            <strong>{article?.title}</strong>" ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
