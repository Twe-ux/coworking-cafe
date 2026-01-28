/**
 * Types pour le module Blog
 */

export type ArticleStatus = "draft" | "published" | "archived"

// Article

export interface ArticleAuthor {
  _id: string
  username: string
  name?: string
  email?: string
  avatar?: string
}

export interface ArticleCategory {
  _id: string
  name: string
  slug: string
}

export interface Article {
  _id?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  author: ArticleAuthor
  category?: ArticleCategory
  status: ArticleStatus
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  ogImage?: string
  viewCount: number
  likeCount: number
  readingTime: number
  createdAt: string
  updatedAt: string
}

export interface CreateArticleData {
  title: string
  content: string
  excerpt?: string
  featuredImage?: string
  categoryId?: string
  status: ArticleStatus
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  ogImage?: string
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  _id: string
}

export interface ArticlesFilter {
  page?: number
  limit?: number
  status?: ArticleStatus | "all"
  category?: string
  search?: string
  sortBy?: "createdAt" | "publishedAt" | "viewCount" | "likeCount"
  sortOrder?: "asc" | "desc"
}

// Category

export interface CategoryParent {
  _id: string
  name: string
  slug: string
}

export interface Category {
  _id?: string
  name: string
  slug: string
  description?: string
  parent?: CategoryParent
  image?: string
  icon?: string
  color?: string
  metaTitle?: string
  metaDescription?: string
  articleCount: number
  order: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  description?: string
  parentId?: string
  image?: string
  icon?: string
  color?: string
  metaTitle?: string
  metaDescription?: string
  order?: number
  isVisible?: boolean
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  _id: string
}

export interface CategoriesFilter {
  page?: number
  limit?: number
  parent?: string | null
  isVisible?: boolean
}
