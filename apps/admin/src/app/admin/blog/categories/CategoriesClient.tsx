"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryForm, type CategoryFormData } from "@/components/blog/CategoryForm";
import { CategoriesTable } from "@/components/blog/CategoriesTable";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types/blog";

interface Message {
  type: "success" | "error";
  text: string;
}

export function CategoriesClient() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories({ includeInactive: true });

  const [message, setMessage] = useState<Message | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (error && !message) {
    setMessage({ type: "error", text: error });
  }

  const handleCreate = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    const result = await createCategory(data);
    setIsSubmitting(false);

    if (result) {
      setMessage({ type: "success", text: "Catégorie créée avec succès" });
      setCreateModalOpen(false);
    } else {
      setMessage({ type: "error", text: "Erreur lors de la création" });
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!selectedCategory?._id) return;
    setIsSubmitting(true);
    const result = await updateCategory(selectedCategory._id, data);
    setIsSubmitting(false);

    if (result) {
      setMessage({ type: "success", text: "Catégorie mise à jour" });
      setEditModalOpen(false);
      setSelectedCategory(null);
    } else {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory?._id) return;
    setIsSubmitting(true);
    const success = await deleteCategory(selectedCategory._id);
    setIsSubmitting(false);

    if (success) {
      setMessage({ type: "success", text: "Catégorie supprimée" });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
    } else {
      setMessage({ type: "error", text: "Erreur lors de la suppression" });
    }
  };

  const handleEditClick = (cat: Category) => {
    setSelectedCategory(cat);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (cat: Category) => {
    setSelectedCategory(cat);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catégories</h1>
          <p className="text-muted-foreground">Gérer les catégories d&apos;articles</p>
        </div>
        <Button
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer une catégorie
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={() => setMessage(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Table */}
      <CategoriesTable
        categories={categories}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une catégorie</DialogTitle>
            <DialogDescription>Ajouter une nouvelle catégorie d&apos;articles</DialogDescription>
          </DialogHeader>
          <CategoryForm onSubmit={handleCreate} onCancel={() => setCreateModalOpen(false)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Éditer la catégorie</DialogTitle>
            <DialogDescription>Modifier les informations de la catégorie</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              initialData={{ name: selectedCategory.name, description: selectedCategory.description }}
              onSubmit={handleUpdate}
              onCancel={() => { setEditModalOpen(false); setSelectedCategory(null); }}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{selectedCategory?.name}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
