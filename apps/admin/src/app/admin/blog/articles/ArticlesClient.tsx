"use client"

import { useState } from "react"
import { useArticles } from "@/hooks/useArticles"
import { useCategories } from "@/hooks/useCategories"
import { ArticlesSkeleton } from "./ArticlesSkeleton"
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
import { Plus, Search, FileText, Eye, Edit, Trash2 } from "lucide-react"
import type { ArticleStatus } from "@/types/blog"
import Image from "next/image"

export function ArticlesClient() {
  const [status, setStatus] = useState<ArticleStatus | "all">("all")
  const [categoryId, setCategoryId] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { articles, loading, error, total, pages, currentPage } = useArticles({
    status,
    category: categoryId !== "all" ? categoryId : undefined,
    search: search || undefined,
    page,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const { categories } = useCategories()

  if (loading) {
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

  const statsData = [
    {
      title: "Total",
      value: articles.length,
      icon: FileText,
    },
    {
      title: "Publiés",
      value: articles.filter((a) => a.status === "published").length,
      icon: Eye,
    },
    {
      title: "Brouillons",
      value: articles.filter((a) => a.status === "draft").length,
      icon: Edit,
    },
    {
      title: "Archivés",
      value: articles.filter((a) => a.status === "archived").length,
      icon: Trash2,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="archived">Archivé</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id || "unknown"}>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-sm font-medium">
                {stat.title}
              </CardDescription>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des articles</CardTitle>
          <CardDescription>
            {total} article{total > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {articles.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun article trouvé
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="flex items-center gap-4 py-3 border-b last:border-0"
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
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(pages, currentPage + 1))}
              disabled={currentPage === pages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
