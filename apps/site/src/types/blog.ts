/**
 * Blog Types - apps/site
 * Types pour le système de blog
 */

/**
 * Aperçu d'un article (liste)
 */
export interface ArticlePreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: CategoryPreview;
  tags: string[];
  publishedAt: Date;
  views: number;
  readTime: number; // Minutes
}

/**
 * Article complet (page détail)
 */
export interface ArticleFull extends ArticlePreview {
  content: string; // HTML content
  author: ArticleAuthor;
  seo: ArticleSEO;
  relatedArticles: ArticlePreview[];
}

/**
 * Catégorie (aperçu)
 */
export interface CategoryPreview {
  id: string;
  name: string;
  slug: string;
}

/**
 * Catégorie avec compteur d'articles
 */
export interface CategoryWithCount extends CategoryPreview {
  articleCount: number;
  description?: string;
}

/**
 * Auteur d'un article
 */
export interface ArticleAuthor {
  name: string;
  avatar?: string;
  bio?: string;
}

/**
 * Métadonnées SEO d'un article
 */
export interface ArticleSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

/**
 * Commentaire d'un article
 */
export interface ArticleComment {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: Date;
  likeCount: number;
  replies: ArticleComment[];
  status: 'pending' | 'approved' | 'rejected' | 'spam';
}

/**
 * Auteur d'un commentaire
 */
export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

/**
 * Données de création de commentaire
 */
export interface CreateCommentData {
  articleSlug: string;
  content: string;
  parentId?: string; // Pour les réponses
}

/**
 * Filtres de recherche d'articles
 */
export interface ArticleFilters {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
