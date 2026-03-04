"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface ArticlesTableProps {
  articles: Article[];
  loading: boolean;
  onEdit: (articleId: string) => void;
  onDelete: (article: Article) => void;
  onStatusToggle: (articleId: string, currentStatus: "draft" | "published") => void;
}

export function ArticlesTable({
  articles,
  loading,
  onEdit,
  onDelete,
  onStatusToggle,
}: ArticlesTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">Aucun article trouvé</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article._id}>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {article.slug}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs border-blue-500 bg-blue-50 text-blue-700 pointer-events-none">
                  {article.category.name}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={article.status === "published" ? "bg-green-500" : "bg-gray-500"}
                >
                  {article.status === "published" ? "Publié" : "Brouillon"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(article.createdAt), "d MMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                {article.createdBy
                  ? `${article.createdBy.givenName || ""} ${article.createdBy.familyName || ""}`.trim()
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    onClick={() => onStatusToggle(article._id, article.status)}
                    title={
                      article.status === "published"
                        ? "Mettre en brouillon"
                        : "Publier"
                    }
                  >
                    {article.status === "published" ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onEdit(article._id)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(article)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
