"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Article, ArticleStatus } from "@/types/blog"
import type { Category } from "@/types/blog"

interface ArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  categories: Category[]
  onSuccess: () => void
}

export function ArticleDialog({
  open,
  onOpenChange,
  article,
  categories,
  onSuccess,
}: ArticleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    categoryId: "",
    status: "draft" as ArticleStatus,
    metaTitle: "",
    metaDescription: "",
  })

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        featuredImage: article.featuredImage || "",
        categoryId: article.category?._id || "",
        status: article.status || "draft",
        metaTitle: article.metaTitle || "",
        metaDescription: article.metaDescription || "",
      })
    } else {
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        featuredImage: "",
        categoryId: "",
        status: "draft",
        metaTitle: "",
        metaDescription: "",
      })
    }
  }, [article, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      alert("Le titre et le contenu sont requis")
      return
    }

    setLoading(true)

    try {
      const url = article
        ? `/api/blog/articles/${article._id}`
        : "/api/blog/articles"
      const method = article ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la sauvegarde")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving article:", error)
      alert(
        error instanceof Error ? error.message : "Erreur lors de la sauvegarde"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? "Modifier l'article" : "Nouvel article"}
          </DialogTitle>
          <DialogDescription>
            {article
              ? "Modifiez les informations de l'article"
              : "Créez un nouvel article pour le blog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Titre de l'article"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ArticleStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune catégorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id || ""}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Extrait</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Court résumé de l'article..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Contenu de l'article (Markdown supporté)..."
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              Markdown supporté pour le formatage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Image à la une (URL)</Label>
            <Input
              id="featuredImage"
              type="url"
              value={formData.featuredImage}
              onChange={(e) =>
                setFormData({ ...formData, featuredImage: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta titre (SEO)</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) =>
                setFormData({ ...formData, metaTitle: e.target.value })
              }
              placeholder="Titre pour les moteurs de recherche"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              Max 60 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta description (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, metaDescription: e.target.value })
              }
              placeholder="Description pour les moteurs de recherche"
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              Max 160 caractères
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : article ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
