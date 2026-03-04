"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ArrowLeft, X } from "lucide-react";
import { ArticleForm, type ArticleFormData } from "@/components/blog/ArticleForm";

interface EditArticleClientProps {
  articleId: string;
}

export function EditArticleClient({ articleId }: EditArticleClientProps) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleFormData | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch article
        const articleRes = await fetch(`/api/blog/articles/${articleId}`);
        const articleData = await articleRes.json();

        if (!articleData.success) {
          setMessage({
            type: "error",
            text: "Article introuvable",
          });
          return;
        }

        // Fetch categories
        const categoriesRes = await fetch("/api/blog/categories");
        const categoriesData = await categoriesRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data || []);
        }

        // Set article data
        const art = articleData.data;
        setArticle({
          title: art.title,
          slug: art.slug,
          content: art.content,
          excerpt: art.excerpt || "",
          category: typeof art.category === "object" ? art.category._id : art.category,
          imgSrc: art.featuredImage || "",
          imgAlt: art.imgAlt || "",
          status: art.status,
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: "Erreur lors du chargement",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [articleId]);

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      // Map imgSrc to featuredImage for API
      const { imgSrc, imgAlt, ...rest } = data;
      const apiData = {
        ...rest,
        featuredImage: imgSrc,
      };

      const response = await fetch(`/api/blog/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Article mis à jour avec succès !",
        });

        setTimeout(() => {
          router.push("/admin/blog/articles");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la mise à jour de l'article",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/blog/articles");
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Article introuvable</p>
        <Button
          variant="outline"
          className="mt-4 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={handleCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
          onClick={handleCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Éditer l'article</h1>
          <p className="text-muted-foreground">
            Modifier les informations de l'article
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Form */}
      <ArticleForm
        initialData={article}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        categories={categories}
      />
    </div>
  );
}
