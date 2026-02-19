"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { Plus, X } from "lucide-react";
import { ArticlesTable } from "@/components/blog/ArticlesTable";
import { ArticlesFilters } from "@/components/blog/ArticlesFilters";
import { ArticlesTableSkeleton } from "@/components/blog/ArticlesTableSkeleton";
import { DeleteArticleDialog } from "@/components/blog/DeleteArticleDialog";
import { CreateArticleModal } from "@/components/blog/CreateArticleModal";

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: {
    _id: string;
    name: string;
  };
  status: "draft" | "published";
  createdAt: string;
  createdBy?: {
    givenName?: string;
    familyName?: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ArticlesClient() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (categoryFilter) {
        params.set("category", categoryFilter);
      }

      const response = await fetch(`/api/blog/articles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data.articles || []);
        setPagination(data.data.pagination);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du chargement",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du chargement des articles",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, statusFilter, categoryFilter]);

  const handleEditClick = (articleId: string) => {
    router.push(`/admin/blog/articles/${articleId}/edit`);
  };

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/blog/articles/${articleToDelete._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Article supprimé avec succès",
        });
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
        fetchArticles();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la suppression",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la suppression de l'article",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (articleId: string, currentStatus: "draft" | "published") => {
    const newStatus: "draft" | "published" = currentStatus === "published" ? "draft" : "published";

    try {
      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Article ${newStatus === "published" ? "publié" : "mis en brouillon"}`,
        });
        fetchArticles();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du changement de statut",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du changement de statut",
      });
    }
  };

  const handleCreateSuccess = () => {
    setMessage({
      type: "success",
      text: "Article créé avec succès !",
    });
    fetchArticles();
  };

  if (loading && articles.length === 0) {
    return <ArticlesTableSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground">
            Gérer les articles du blog
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer un article
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Filters */}
      <ArticlesFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* Table */}
      <ArticlesTable
        articles={articles}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onStatusToggle={handleStatusToggle}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <CreateArticleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleCreateSuccess}
        categories={categories}
      />

      {/* Delete Dialog */}
      <DeleteArticleDialog
        open={deleteDialogOpen}
        article={articleToDelete}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setArticleToDelete(null);
        }}
      />
    </div>
  );
}
