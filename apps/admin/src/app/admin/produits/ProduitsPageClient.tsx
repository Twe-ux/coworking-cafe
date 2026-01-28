"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Coffee, UtensilsCrossed, ShoppingBasket, Gift, Package, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProduitsManager } from "@/hooks/useProduitsManager";
import { SortableCategoryList } from "@/components/produits/SortableCategoryList";
import { ProduitsItemsByCategoryList } from "@/components/produits/ProduitsItemsByCategoryList";
import { ProduitsCategoryModal } from "@/components/produits/ProduitsCategoryModal";
import { ProduitsItemModal } from "@/components/produits/ProduitsItemModal";
import { ProduitsPageSkeleton } from "./ProduitsPageSkeleton";
import type { ProduitsCategory, ProduitsItem, ProduitsItemType } from "@/types/produits";

export function ProduitsPageClient() {
  const { toast } = useToast();
  const {
    categories,
    items,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    refetch,
  } = useProduitsManager(); // Sans type filter, on récupère tout

  // Filter state
  const [selectedType, setSelectedType] = useState<ProduitsItemType | "all">("all");
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showInactiveItems, setShowInactiveItems] = useState(false);

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProduitsCategory | undefined>();
  const [editingItem, setEditingItem] = useState<ProduitsItem | undefined>();

  // Calculate stats per type - MUST be before conditional returns
  const stats = useMemo(() => {
    return {
      total: {
        categories: categories.length,
        items: items.length,
      },
      drink: {
        categories: categories.filter((c) => c.type === "drink").length,
        items: items.filter((i) => i.type === "drink").length,
      },
      food: {
        categories: categories.filter((c) => c.type === "food").length,
        items: items.filter((i) => i.type === "food").length,
      },
      grocery: {
        categories: categories.filter((c) => c.type === "grocery").length,
        items: items.filter((i) => i.type === "grocery").length,
      },
      goodies: {
        categories: categories.filter((c) => c.type === "goodies").length,
        items: items.filter((i) => i.type === "goodies").length,
      },
    };
  }, [categories, items]);

  // Filter categories and items by selected type - MUST be before conditional returns
  const filteredCategories = useMemo(() => {
    let result = categories;

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((c) => c.type === selectedType);
    }

    // Filter by active status: show ONLY active OR ONLY inactive
    if (showInactiveCategories) {
      // Afficher uniquement les inactives
      result = result.filter((c) => !c.isActive);
    } else {
      // Afficher uniquement les actives
      result = result.filter((c) => c.isActive);
    }

    return result;
  }, [categories, selectedType, showInactiveCategories]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((i) => i.type === selectedType);
    }

    // Filter by active status: show ONLY active OR ONLY inactive
    if (showInactiveItems) {
      // Afficher uniquement les inactifs
      result = result.filter((i) => !i.isActive);
    } else {
      // Afficher uniquement les actifs
      result = result.filter((i) => i.isActive);
    }

    // Sort by order within category (the grouping is done in the component)
    return [...result].sort((a, b) => a.order - b.order);
  }, [items, selectedType, showInactiveItems]);

  // Conditional returns AFTER all hooks
  if (loading) {
    return <ProduitsPageSkeleton />;
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

  // Handlers - Catégories
  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: ProduitsCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: any) => {
    const success = editingCategory
      ? await updateCategory(editingCategory.id, data)
      : await createCategory(data);

    if (success) {
      toast({
        title: editingCategory ? "Catégorie modifiée" : "Catégorie créée",
        description: editingCategory
          ? "La catégorie a été modifiée avec succès"
          : "La catégorie a été créée avec succès",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }

    return success;
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    const success = await deleteCategory(id);
    if (success) {
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    }
  };

  // Handlers - Items
  const handleCreateItem = () => {
    setEditingItem(undefined);
    setItemModalOpen(true);
  };

  const handleEditItem = (item: ProduitsItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    const success = editingItem
      ? await updateItem(editingItem.id, data)
      : await createItem(data);

    if (success) {
      toast({
        title: editingItem ? "Item modifié" : "Item créé",
        description: editingItem
          ? "L'item a été modifié avec succès"
          : "L'item a été créé avec succès",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }

    return success;
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet item ?")) return;

    const success = await deleteItem(id);
    if (success) {
      toast({
        title: "Item supprimé",
        description: "L'item a été supprimé avec succès",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'item",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Produits</h1>
          <p className="text-muted-foreground">
            Gérez vos catégories et produits par type
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCategory}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle catégorie
          </Button>
          <Button onClick={handleCreateItem} variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel item
          </Button>
        </div>
      </div>

      {/* Filter Cards - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === "drink" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setSelectedType("drink")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boissons</CardTitle>
            <Coffee className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drink.items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.drink.categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === "food" ? "ring-2 ring-orange-500" : ""
          }`}
          onClick={() => setSelectedType("food")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nourriture</CardTitle>
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.food.items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.food.categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === "grocery" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setSelectedType("grocery")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Épicerie</CardTitle>
            <ShoppingBasket className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.grocery.items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.grocery.categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === "goodies" ? "ring-2 ring-purple-500" : ""
          }`}
          onClick={() => setSelectedType("goodies")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goodies</CardTitle>
            <Gift className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.goodies.items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.goodies.categories} catégories
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedType === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setSelectedType("all")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.items}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total.categories} catégories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Catégories */}
      <Card>
        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCategoriesExpanded(!categoriesExpanded)}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
            >
              {categoriesExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
            <h2 className="text-xl font-semibold">
              Catégories
              <span className="text-sm text-muted-foreground ml-2">
                ({filteredCategories.length})
              </span>
            </h2>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Switch
              id="show-inactive"
              checked={showInactiveCategories}
              onCheckedChange={setShowInactiveCategories}
            />
            <Label htmlFor="show-inactive" className="cursor-pointer">
              {showInactiveCategories ? "Catégories inactives" : "Catégories actives"}
            </Label>
          </div>
        </div>

        {categoriesExpanded && (
          <div className="border-t p-4">
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {showInactiveCategories
                  ? "Aucune catégorie inactive"
                  : "Aucune catégorie"}
                {selectedType !== "all" && " pour ce type"}.
              </div>
            ) : (
              <SortableCategoryList
                categories={filteredCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onReorder={async () => {
                  // Recharger les données pour afficher le nouvel ordre
                  await refetch();
                }}
              />
            )}
          </div>
        )}
      </Card>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Items
            <span className="text-sm text-muted-foreground ml-2">
              ({filteredItems.length})
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive-items"
              checked={showInactiveItems}
              onCheckedChange={setShowInactiveItems}
            />
            <Label htmlFor="show-inactive-items" className="cursor-pointer">
              {showInactiveItems ? "Items inactifs" : "Items actifs"}
            </Label>
          </div>
        </div>
        <ProduitsItemsByCategoryList
          items={filteredItems}
          categories={filteredCategories}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onReorderItems={async () => {
            // Recharger les données pour afficher le nouvel ordre
            await refetch();
          }}
          showInactive={showInactiveItems}
        />
      </div>

      {/* Modals */}
      <ProduitsCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        fixedType={selectedType !== "all" ? selectedType : undefined}
      />

      <ProduitsItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={filteredCategories}
        fixedType={selectedType !== "all" ? selectedType : undefined}
      />
    </div>
  );
}
