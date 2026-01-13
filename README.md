# CoworKing Café by Anticafé - Monorepo

Monorepo contenant le site public et le dashboard admin du CoworKing Café by Anticafé.

## Structure

```
coworking-cafe/
├── apps/
│   ├── site/              # Site public + Dashboard client (Bootstrap)
│   └── admin/             # Dashboard admin (Tailwind + shadcn/ui)
├── packages/
│   ├── database/          # MongoDB models partagés
│   ├── email/             # Service email et templates
│   └── shared/            # Types et utils partagés
```

## Tech Stack

- **Site**: Next.js 14, Bootstrap 5, SCSS
- **Admin**: Next.js 14, Tailwind CSS v4, shadcn/ui
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js
- **Email**: Resend

## Development

```bash
# Install dependencies
pnpm install

# Run both apps in parallel
pnpm dev

# Run site only
pnpm dev:site

# Run admin only
pnpm dev:admin
```

## Build

```bash
# Build all apps
pnpm build

# Build site only
pnpm build:site

# Build admin only
pnpm build:admin
```

## Deployment

- **Site**: Northflank (https://coworkingcafe.fr)
- **Admin**: Northflank (https://admin.coworkingcafe.fr)
