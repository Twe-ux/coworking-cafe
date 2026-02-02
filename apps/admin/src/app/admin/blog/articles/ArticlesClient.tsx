"use client"

import { useState, useMemo, useEffect } from "react"
import { useArticles } from "@/hooks/useArticles"
import { useCategories } from "@/hooks/useCategories"
import { ArticlesSkeleton } from "./ArticlesSkeleton"
import { ArticleDialog } from "./ArticleDialog"
import { DeleteArticleDialog } from "./DeleteArticleDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Eye, Edit, Trash2, Archive } from "lucide-react"
import type { ArticleStatus, Article } from "@/types/blog"
import Image from "next/image"

export function ArticlesClient() {
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("published")
  const [categoryId, setCategoryId] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [articleDialogOpen, setArticleDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  // Load ALL articles to calculate stats
  const { articles: allArticles, loading, error, refetch } = useArticles({
    status: "all",
    page: 1,
    limit: 1000, // Get all articles for stats
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const { categories, loading: categoriesLoading } = useCategories()

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, categoryId, search])

  // Calculate stats from all articles
  const stats = useMemo(() => {
    return {
      total: allArticles.length,
      published: allArticles.filter((a) => a.status === "published").length,
      draft: allArticles.filter((a) => a.status === "draft").length,
      archived: allArticles.filter((a) => a.status === "archived").length,
    }
  }, [allArticles])

  // Filter articles based on statusFilter, categoryId, and search
  const filteredArticles = useMemo(() => {
    let result = allArticles

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter)
    }

    // Filter by category
    if (categoryId !== "all") {
      result = result.filter((a) => a.category?._id === categoryId)
    }

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerSearch) ||
          a.excerpt?.toLowerCase().includes(lowerSearch)
      )
    }

    return result
  }, [allArticles, statusFilter, categoryId, search])

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  const handleCreate = () => {
    setSelectedArticle(null)
    setArticleDialogOpen(true)
  }

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setArticleDialogOpen(true)
  }

  const handleDelete = (article: Article) => {
    setSelectedArticle(article)
    setDeleteDialogOpen(true)
  }

  const handleSuccess = () => {
    refetch()
  }

  if (loading || categoriesLoading) {
    return <ArticlesSkeleton />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  const statusColors: Record<ArticleStatus | "all", string> = {
    all: "default",
    draft: "secondary",
    published: "default",
    archived: "destructive",
  }


  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories
              .filter(cat => cat._id && cat._id.trim().length > 0)
              .map((cat) => (
                <SelectItem key={cat._id} value={cat._id!}>
                  {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "published" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setStatusFilter("published")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publiés</CardTitle>
            <Eye className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "draft" ? "ring-2 ring-orange-500" : ""}`}
          onClick={() => setStatusFilter("draft")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <Edit className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "archived" ? "ring-2 ring-red-500" : ""}`}
          onClick={() => setStatusFilter("archived")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivés</CardTitle>
            <Archive className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des articles</CardTitle>
          <CardDescription>
            {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""} trouvé{filteredArticles.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedArticles.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun article trouvé
            </div>
          ) : (
            paginatedArticles.map((article) => (
              <div
                key={article._id}
                className="flex items-center gap-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleEdit(article)}
              >
                {article.featuredImage && (
                  <div className="relative w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={statusColors[article.status] as never}>
                      {article.status}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline">{article.category.name}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {article.readingTime} min de lecture
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(article)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(article)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ArticleDialog
        open={articleDialogOpen}
        onOpenChange={setArticleDialogOpen}
        article={selectedArticle}
        categories={categories}
        onSuccess={handleSuccess}
      />

      <DeleteArticleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        article={selectedArticle}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
