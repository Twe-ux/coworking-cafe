/**
 * Types pour le module Blog
 */

export type ArticleStatus = "draft" | "published" | "archived"
export type CommentStatus = "pending" | "approved" | "rejected" | "spam"

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

export interface ArticleTag {
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
  tags?: ArticleTag[]
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
  tagIds?: string[]
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
  tag?: string
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
  isActive: boolean
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

// Tag

export interface Tag {
  _id?: string
  name: string
  slug: string
  description?: string
  color?: string
  articleCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateTagData {
  name: string
  description?: string
  color?: string
}

export interface UpdateTagData extends Partial<CreateTagData> {
  _id: string
}

export interface TagsFilter {
  page?: number
  limit?: number
}

// Comment

export interface CommentUser {
  _id: string
  username: string
  name?: string
  email?: string
  avatar?: string
}

export interface CommentArticle {
  _id: string
  title: string
  slug: string
}

export interface CommentParent {
  _id: string
  content: string
  user: CommentUser
}

export interface Comment {
  _id?: string
  content: string
  article: CommentArticle
  user: CommentUser
  parent?: CommentParent | null
  status: CommentStatus
  likeCount: number
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export interface CreateCommentData {
  content: string
  articleId: string
  parentId?: string
}

export interface CommentsFilter {
  page?: number
  limit?: number
  article?: string
  status?: CommentStatus | "all"
}
