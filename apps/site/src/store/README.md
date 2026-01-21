# Redux Store Structure

## Overview

This project uses **Redux Toolkit** with **RTK Query** for state management.

## Directory Structure

```
src/store/
├── index.ts              # Store configuration
├── hooks.ts              # Typed Redux hooks
├── api/                  # RTK Query APIs
│   └── blogApi.ts       # Blog/Articles API
└── slices/              # Redux slices (local state)
    └── uiSlice.ts       # UI state (notifications, modals, sidebar)
```

## Usage

### Using RTK Query (Server State)

```typescript
'use client'
import { useGetArticlesQuery } from '@/store/api/blogApi'

export function BlogList() {
  const { data, error, isLoading } = useGetArticlesQuery({
    page: 1,
    limit: 10
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error</div>

  return (
    <div>
      {data?.articles.map(article => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  )
}
```

### Using Redux Slices (Client State)

```typescript
'use client'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'

export function SidebarToggle() {
  const dispatch = useAppDispatch()
  const isSidebarOpen = useAppSelector(state => state.ui.isSidebarOpen)

  return (
    <button onClick={() => dispatch(toggleSidebar())}>
      {isSidebarOpen ? 'Close' : 'Open'} Sidebar
    </button>
  )
}
```

### Using Custom Hooks

```typescript
'use client'
import { useNotification } from '@/hooks/useNotification'

export function MyComponent() {
  const { success, error } = useNotification()

  const handleSave = async () => {
    try {
      await saveData()
      success('Data saved successfully!')
    } catch (e) {
      error('Failed to save data')
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

## API Endpoints (blogApi)

### Queries
- `useGetArticlesQuery(filters?)` - Get paginated articles list
- `useGetArticleBySlugQuery(slug)` - Get article by slug (public)
- `useGetArticleByIdQuery(id)` - Get article by ID (admin)

### Mutations
- `useCreateArticleMutation()` - Create new article
- `useUpdateArticleMutation()` - Update existing article
- `useDeleteArticleMutation()` - Delete article
- `useTogglePublishMutation()` - Publish/unpublish article
- `useIncrementViewCountMutation()` - Increment view count
- `useToggleLikeMutation()` - Like/unlike article

## Features

### Automatic Caching
RTK Query automatically caches API responses and manages cache invalidation.

### Optimistic Updates
Mutations can optimistically update the UI before the server responds.

### TypeScript Support
Full TypeScript support with typed hooks and auto-generated types.

### DevTools
Redux DevTools available in development mode for debugging.

## Next Steps

1. Create API routes in `/api/articles`
2. Connect admin dashboard pages to use RTK Query
3. Connect public blog pages to fetch real data
4. Add more APIs (categories, tags, comments)
5. Implement WebSocket middleware for real-time updates
