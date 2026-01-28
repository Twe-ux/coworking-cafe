"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Coffee, UtensilsCrossed, ShoppingBasket, Gift, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useProduitsManager } from "@/hooks/useProduitsManager";
import { ProduitsCategoryRow } from "@/components/produits/ProduitsCategoryRow";
import { ProduitsItemCard } from "@/components/produits/ProduitsItemCard";
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
  } = useProduitsManager(); // Sans type filter, on récupère tout

  // Filter state
  const [selectedType, setSelectedType] = useState<ProduitsItemType | "all">("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProduitsCategory | undefined>();
  const [editingItem, setEditingItem] = useState<ProduitsItem | undefined>();

  // Reset category filter when type changes
  useEffect(() => {
    setSelectedCategoryId("all");
  }, [selectedType]);

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

  // Calculate stats per type
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

  // Filter categories and items by selected type
  const filteredCategories = useMemo(() => {
    if (selectedType === "all") return categories;
    return categories.filter((c) => c.type === selectedType);
  }, [categories, selectedType]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Filter by type
    if (selectedType !== "all") {
      result = result.filter((i) => i.type === selectedType);
    }

    // Filter by category
    if (selectedCategoryId !== "all") {
      result = result.filter((i) => i.category.id === selectedCategoryId);
    }

    // Sort by category name, then by order
    return [...result].sort((a, b) => {
      const categoryCompare = a.category.name.localeCompare(b.category.name);
      if (categoryCompare !== 0) return categoryCompare;
      return a.order - b.order;
    });
  }, [items, selectedType, selectedCategoryId]);

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

  const handleToggleCategoryActive = async (id: string, isActive: boolean) => {
    await updateCategory(id, { isActive });
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

  const handleToggleItemActive = async (id: string, isActive: boolean) => {
    await updateItem(id, { isActive });
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
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Catégories
          {selectedType !== "all" && (
            <span className="text-sm text-muted-foreground ml-2">
              ({filteredCategories.length})
            </span>
          )}
        </h2>
        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune catégorie
              {selectedType !== "all" && " pour ce type"}. Créez-en une pour commencer.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <ProduitsCategoryRow
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onToggleActive={handleToggleCategoryActive}
              />
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Items
            {selectedType !== "all" && (
              <span className="text-sm text-muted-foreground ml-2">
                ({filteredItems.length})
              </span>
            )}
          </h2>
          {filteredCategories.length > 0 && (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Toutes les catégories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun item. Créez-en un pour commencer.
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun item
              {selectedCategoryId !== "all" && " dans cette catégorie"}
              {selectedType !== "all" && selectedCategoryId === "all" && " pour ce type"}.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <ProduitsItemCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onToggleActive={handleToggleItemActive}
              />
            ))}
          </div>
        )}
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
