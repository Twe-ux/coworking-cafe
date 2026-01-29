"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProduitsManager } from "@/hooks/useProduitsManager";
import { RecipesPageSkeleton } from "./RecipesPageSkeleton";
import type { ProduitsItem, ProduitsCategory, ProduitsItemType } from "@/types/produits";

export function RecipesPageClient() {
  const [selectedType, setSelectedType] = useState<ProduitsItemType>("food");
  const { categories, items, loading, error } = useProduitsManager({
    type: selectedType,
    activeOnly: true,
  });

  if (loading) {
    return <RecipesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grouper les items par catégorie
  const itemsByCategory: Record<string, ProduitsItem[]> = {};
  items.forEach((item) => {
    const categoryId = item.category.id;
    if (!itemsByCategory[categoryId]) {
      itemsByCategory[categoryId] = [];
    }
    itemsByCategory[categoryId].push(item);
  });

  // Stats
  const totalItems = items.length;
  const itemsWithRecipe = items.filter((item) => item.recipe).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Recettes du Menu</h1>
        <p className="text-muted-foreground">
          Consultez les recettes et instructions de préparation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec recette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsWithRecipe}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((itemsWithRecipe / totalItems) * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Food/Drinks */}
      <Tabs
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as ProduitsItemType)}
      >
        <TabsList>
          <TabsTrigger value="food">Nourriture</TabsTrigger>
          <TabsTrigger value="drink">Boissons</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-6 mt-6">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Aucune catégorie disponible.
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
              const categoryItems = itemsByCategory[category.id] || [];

              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-4">
                  {/* Titre de catégorie */}
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Items de la catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryItems.map((item) => (
                      <RecipeCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Carte affichant la recette d'un item
 */
function RecipeCard({ item }: { item: ProduitsItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {item.recipe && (
            <Badge variant="outline" className="text-xs">
              Recette disponible
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Image */}
        {item.image && (
          <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        {/* Recette */}
        {item.recipe && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Recette / Instructions</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Réduire" : "Voir plus"}
              </Button>
            </div>

            {expanded && (
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {item.recipe}
                </pre>
              </div>
            )}
          </div>
        )}

        {!item.recipe && (
          <p className="text-sm text-muted-foreground italic">
            Aucune recette disponible pour cet item.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
