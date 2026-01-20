"use client"

import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Edit, Trash2, FolderTree } from "lucide-react"

export function CategoriesClient() {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderTree className="w-8 h-8" />
          Catégories
        </h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucune catégorie trouvée
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color || "#10B981" }}
                  />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {category.articleCount} article{category.articleCount > 1 ? "s" : ""}
                      </Badge>
                      {!category.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
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
    </div>
  )
}
