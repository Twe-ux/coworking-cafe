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
import type { Category } from "@/types/blog"

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  onSuccess: () => void
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: DeleteCategoryDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!category) return

    setLoading(true)

    try {
      const response = await fetch(`/api/blog/categories/${category._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting category:", error)
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
          <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
          <AlertDialogDescription>
            {category && category.articleCount > 0 ? (
              <span className="block text-red-600">
                ⚠️ Impossible de supprimer cette catégorie car elle contient{" "}
                {category.articleCount} article
                {category.articleCount > 1 ? "s" : ""}. Veuillez d'abord
                déplacer ou supprimer ces articles.
              </span>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer la catégorie "
                <strong>{category?.name}</strong>" ? Cette action est
                irréversible.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {category && category.articleCount > 0 ? "Fermer" : "Annuler"}
          </AlertDialogCancel>
          {category && category.articleCount === 0 && (
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
