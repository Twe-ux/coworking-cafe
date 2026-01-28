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

// Comment Types
export interface Comment {
  _id: string;
  content: string;
  article: string | { _id: string; title: string; slug: string };
  user: {
    _id: string;
    username: string;
    name?: string;
    email?: string;
  };
  parent?: {
    _id: string;
    content: string;
    user: {
      _id: string;
      username: string;
      name?: string;
    };
  } | string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CommentFilters {
  article?: string;
  status?: string;
  page?: number;
  limit?: number;
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

// Tag Types
export interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {}

export interface TagsResponse {
  tags: Tag[];
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
    'Tags',
    'Comment',
    'Comments',
    'CommentLikes',
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

    // ========== COMMENTS ==========

    // Get comments for an article
    getComments: builder.query<CommentsResponse, CommentFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
        return `/comments?${params.toString()}`;
      },
      providesTags: (result, error, { article }) =>
        result
          ? [
              ...result.comments.map(({ _id }) => ({
                type: 'Comment' as const,
                id: _id,
              })),
              { type: 'Comments' as const, id: article || 'ALL' },
            ]
          : [{ type: 'Comments' as const, id: article || 'ALL' }],
    }),

    // Get single comment
    getComment: builder.query<Comment, string>({
      query: (id) => `/comments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Comment', id }],
    }),

    // Create comment
    createComment: builder.mutation<Comment, CreateCommentDto>({
      query: (data) => ({
        url: '/comments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { articleId }) => [
        { type: 'Comments', id: articleId },
        { type: 'Comments', id: 'ALL' },
      ],
    }),

    // Update comment
    updateComment: builder.mutation<Comment, { id: string; data: UpdateCommentDto }>({
      query: ({ id, data }) => ({
        url: `/comments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Comment', id },
      ],
    }),

    // Delete comment
    deleteComment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Comment', id },
        { type: 'Comments', id: 'ALL' },
      ],
    }),

    // Approve/Reject comment (admin)
    approveComment: builder.mutation<Comment, { id: string; status: 'approved' | 'rejected' | 'spam' }>({
      query: ({ id, status }) => ({
        url: `/comments/${id}/approve`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Comment', id },
        { type: 'Comments', id: 'ALL' },
      ],
    }),

    // Check if comment is liked by current user
    isCommentLiked: builder.query<{ liked: boolean }, string>({
      query: (id) => `/comments/${id}/like`,
      providesTags: (result, error, id) => [{ type: 'CommentLikes', id }],
    }),

    // Like comment
    likeComment: builder.mutation<
      { success: boolean; liked: boolean; likeCount: number },
      string
    >({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CommentLikes', id },
        { type: 'Comment', id },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          blogApi.util.updateQueryData('getComment', id, (draft) => {
            draft.likeCount += 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Unlike comment
    unlikeComment: builder.mutation<
      { success: boolean; liked: boolean; likeCount: number },
      string
    >({
      query: (id) => ({
        url: `/comments/${id}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'CommentLikes', id },
        { type: 'Comment', id },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          blogApi.util.updateQueryData('getComment', id, (draft) => {
            draft.likeCount -= 1;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
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

    // ========== TAGS ==========

    // Get all tags
    getTags: builder.query<TagsResponse, { search?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, String(value));
          });
        }
        return `/tags?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.tags.map(({ _id }) => ({
                type: 'Tags' as const,
                id: _id,
              })),
              { type: 'Tags' as const, id: 'LIST' },
            ]
          : [{ type: 'Tags' as const, id: 'LIST' }],
    }),

    // Get single tag
    getTag: builder.query<Tag, string>({
      query: (id) => `/tags/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tags', id }],
    }),

    // Create tag
    createTag: builder.mutation<Tag, CreateTagDto>({
      query: (data) => ({
        url: '/tags',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Tags', id: 'LIST' }],
    }),

    // Update tag
    updateTag: builder.mutation<Tag, { id: string; data: UpdateTagDto }>({
      query: ({ id, data }) => ({
        url: `/tags/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tags', id },
        { type: 'Tags', id: 'LIST' },
      ],
    }),

    // Delete tag
    deleteTag: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tags', id: 'LIST' }],
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
  // Comment hooks
  useGetCommentsQuery,
  useGetCommentQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useApproveCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useIsCommentLikedQuery,
  // Category hooks
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  // Tag hooks
  useGetTagsQuery,
  useGetTagQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = blogApi;
