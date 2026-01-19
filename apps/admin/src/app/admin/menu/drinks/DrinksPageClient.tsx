"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMenuManager } from "@/hooks/useMenuManager";
import { MenuCategoryRow } from "@/components/menu/MenuCategoryRow";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { MenuCategoryModal } from "@/components/menu/MenuCategoryModal";
import { MenuItemModal } from "@/components/menu/MenuItemModal";
import { DrinksPageSkeleton } from "./DrinksPageSkeleton";
import type { MenuCategory, MenuItem } from "@/types/menu";

export function DrinksPageClient() {
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
  } = useMenuManager({ type: "drink" });

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | undefined>();
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();

  if (loading) {
    return <DrinksPageSkeleton />;
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

  // Handlers - Catégories
  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: any) => {
    const success = editingCategory
      ? await updateCategory(editingCategory.id, data)
      : await createCategory({ ...data, type: "drink" });

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

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    const success = editingItem
      ? await updateItem(editingItem.id, data)
      : await createItem({ ...data, type: "drink" });

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
          <h1 className="text-3xl font-bold">Menu - Boissons</h1>
          <p className="text-muted-foreground">
            Gérez les catégories et items de boissons
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
              <MenuCategoryRow
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
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun item. Créez-en un pour commencer.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <MenuItemCard
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
      <MenuCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        fixedType="drink"
      />

      <MenuItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
        fixedType="drink"
      />
    </div>
  );
}
