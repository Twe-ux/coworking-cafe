import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: {
    _id: string;
    username: string;
    name?: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  // SEO fields are stored as separate fields in the database, not grouped in an object
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  viewCount: number;
  likeCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  status?: 'draft' | 'published';
  // SEO fields as separate properties to match database schema
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  tag?: string;
  search?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}


// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  };
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  articleCount: number;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  icon?: string;
  color?: string;
  metaTitle?: string;
  metaDescription?: string;
  order?: number;
  isVisible?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}


export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Add auth token if needed
      // const token = getToken();
      // if (token) {
      //   headers.set('authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),
  tagTypes: [
    'Article',
    'Articles',
    'ArticleLikes',
    'Categories',
  ],
  endpoints: (builder) => ({
    // Get all articles (with filters)
    getArticles: builder.query<ArticlesResponse, ArticleFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, String(value));
            }
          });
        }
        return `/articles?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.articles.map(({ _id }) => ({ type: 'Article' as const, id: _id })),
              { type: 'Articles' as const, id: 'LIST' },
            ]
          : [{ type: 'Articles' as const, id: 'LIST' }],
    }),

    // Get single article by slug
    getArticleBySlug: builder.query<Article, string>({
      query: (slug) => `/articles/${slug}`,
      providesTags: (result) =>
        result ? [{ type: 'Article', id: result._id }] : [],
    }),

    // Get article by ID (for editing)
    getArticleById: builder.query<Article, string>({
      query: (id) => `/articles/id/${id}`,
      providesTags: (result) =>
        result ? [{ type: 'Article', id: result._id }] : [],
    }),

    // Create article
    createArticle: builder.mutation<Article, CreateArticleDto>({
      query: (article) => ({
        url: '/articles',
        method: 'POST',
        body: article,
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),

    // Update article
    updateArticle: builder.mutation<Article, { id: string; data: UpdateArticleDto }>({
      query: ({ id, data }) => ({
        url: `/articles/id/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Article', id },
        { type: 'Articles', id: 'LIST' },
      ],
    }),

    // Delete article
    deleteArticle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/articles/id/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),

    // Publish/Unpublish article
    togglePublish: builder.mutation<Article, string>({
      query: (id) => ({
        url: `/articles/id/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Article', id },
        { type: 'Articles', id: 'LIST' },
      ],
    }),

    // Increment view count
    incrementViewCount: builder.mutation<{ viewCount: number }, string>({
      query: (slug) => ({
        url: `/articles/${slug}/view`,
        method: 'POST',
      }),
      // Update cache locally with optimistic update
      async onQueryStarted(slug, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update the cache with the new viewCount
          dispatch(
            blogApi.util.updateQueryData('getArticleBySlug', slug, (draft) => {
              draft.viewCount = data.viewCount;
            })
          );
        } catch {
          // Silently handle error - view count is not critical
        }
      },
    }),

    // Check if article is liked by current user
    isArticleLiked: builder.query<{ liked: boolean }, string>({
      query: (id) => `/articles/id/${id}/like`,
      providesTags: (result, error, id) => [{ type: 'ArticleLikes', id }],
    }),

    // Like article
    likeArticle: builder.mutation<
      { success: boolean; liked: boolean; likeCount: number },
      string
    >({
      query: (id) => ({
        url: `/articles/id/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ArticleLikes', id },
        { type: 'Article', id },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update cache with actual like count from API
          dispatch(
            blogApi.util.updateQueryData('getArticleById', id, (draft) => {
              draft.likeCount = data.likeCount;
            })
          );
        } catch {
          // Error handled by component
        }
      },
    }),

    // Unlike article
    unlikeArticle: builder.mutation<
      { success: boolean; liked: boolean; likeCount: number },
      string
    >({
      query: (id) => ({
        url: `/articles/id/${id}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ArticleLikes', id },
        { type: 'Article', id },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update cache with actual like count from API
          dispatch(
            blogApi.util.updateQueryData('getArticleById', id, (draft) => {
              draft.likeCount = data.likeCount;
            })
          );
        } catch {
          // Error handled by component
        }
      },
    }),

    // Legacy: Toggle like (for backward compatibility)
    toggleLike: builder.mutation<Article, string>({
      query: (id) => ({
        url: `/articles/id/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ArticleLikes', id }],
    }),

    // ========== CATEGORIES ==========

    // Get all categories
    getCategories: builder.query<CategoriesResponse, { visible?: boolean; page?: number; limit?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, String(value));
          });
        }
        return `/categories?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.categories.map(({ _id }) => ({
                type: 'Categories' as const,
                id: _id,
              })),
              { type: 'Categories' as const, id: 'LIST' },
            ]
          : [{ type: 'Categories' as const, id: 'LIST' }],
    }),

    // Get single category
    getCategory: builder.query<Category, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),

    // Create category
    createCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // Update category
    updateCategory: builder.mutation<Category, { id: string; data: UpdateCategoryDto }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Categories', id },
        { type: 'Categories', id: 'LIST' },
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useTogglePublishMutation,
  useIncrementViewCountMutation,
  useToggleLikeMutation,
  useIsArticleLikedQuery,
  useLikeArticleMutation,
  useUnlikeArticleMutation,
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = blogApi;
