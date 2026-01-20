# @coworking-cafe/admin-shared

Shared utilities, types, and hooks for Coworking Cafe admin applications.

## Installation

```bash
npm install @coworking-cafe/admin-shared
```

## Structure

```
src/
├── hooks/          # React hooks
│   ├── useSocket.ts
│   ├── useQueryClient.ts
│   └── useDebounce.ts
├── lib/            # Utilities
│   ├── socket-client.ts
│   ├── api-client.ts
│   ├── format-date.ts
│   └── format-currency.ts
└── types/          # TypeScript types
    ├── socket.ts
    ├── api.ts
    └── common.ts
```

## Usage

### API Client

```typescript
import { get, post, put, del } from '@coworking-cafe/admin-shared'

const result = await get<User>('/api/users/123', { token: 'your-token' })
if (result.success) {
  console.log(result.data)
}
```

### Socket Hook

```typescript
import { useSocket } from '@coworking-cafe/admin-shared'

function MyComponent() {
  const { socket, isConnected } = useSocket({
    url: 'http://localhost:3001',
    token: 'your-token',
  })

  useEffect(() => {
    if (socket) {
      socket.on('message', (data) => {
        console.log('Received:', data)
      })
    }
  }, [socket])
}
```

### Debounce Hook

```typescript
import { useDebounce } from '@coworking-cafe/admin-shared'

function SearchComponent() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    // API call with debouncedSearch
  }, [debouncedSearch])
}
```

### Format Utilities

```typescript
import { formatDate, formatCurrency, timeSince } from '@coworking-cafe/admin-shared'

formatDate(new Date()) // "20 janvier 2026"
formatCurrency(1234.56) // "1 234,56 €"
timeSince(new Date(Date.now() - 3600000)) // "1 heures"
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Clean
npm run clean
```

## License

Private - Coworking Cafe
