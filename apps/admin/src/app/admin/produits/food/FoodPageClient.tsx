"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useProduitsManager } from "@/hooks/useProduitsManager";
import { ProduitsCategoryRow } from "@/components/produits/ProduitsCategoryRow";
import { ProduitsItemCard } from "@/components/produits/ProduitsItemCard";
import { ProduitsCategoryModal } from "@/components/produits/ProduitsCategoryModal";
import { ProduitsItemModal } from "@/components/produits/ProduitsItemModal";
import { FoodPageSkeleton } from "./FoodPageSkeleton";
import type { ProduitsCategory, ProduitsItem } from "@/types/produits";

export function FoodPageClient() {
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
  } = useProduitsManager({ type: "food" });

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProduitsCategory | undefined>();
  const [editingItem, setEditingItem] = useState<ProduitsItem | undefined>();

  // Filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  if (loading) {
    return <FoodPageSkeleton />;
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

  // Stats
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.isActive).length,
    totalItems: items.length,
    activeItems: items.filter((i) => i.isActive).length,
  };

  // Filter and sort items
  const filteredItems = selectedCategoryId === "all"
    ? items
    : items.filter((item) => item.category.id === selectedCategoryId);

  // Sort items by category name, then by order
  const sortedItems = [...filteredItems].sort((a, b) => {
    // First by category name
    const categoryCompare = a.category.name.localeCompare(b.category.name);
    if (categoryCompare !== 0) return categoryCompare;
    // Then by order
    return a.order - b.order;
  });

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
      : await createCategory({ ...data, type: "food" });

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
      : await createItem({ ...data, type: "food" });

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
          <h1 className="text-3xl font-bold">Produits - Nourriture</h1>
          <p className="text-muted-foreground">
            Gérez les catégories et items de nourriture
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCategories} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeItems} actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Catégories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Catégories</h2>
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune catégorie. Créez-en une pour commencer.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
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
          <h2 className="text-xl font-semibold">Items</h2>
          {categories.length > 0 && (
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
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
        ) : sortedItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun item dans cette catégorie.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedItems.map((item) => (
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
        fixedType="food"
      />

      <ProduitsItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
        fixedType="food"
      />
    </div>
  );
}
