# 🚀 Déploiement Northflank - CoworKing Café

Guide complet de déploiement du monorepo Next.js sur Northflank.

---

## 🎯 Architecture de Déploiement

### Décision: Tout sur Northflank ✅

**Raison principale**: Support WebSocket requis pour `/apps/site/dashboard/messages`

```
┌─────────────────────────────────────────────────────┐
│                   NORTHFLANK                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐  ┌─────────────────┐         │
│  │   apps/admin    │  │   apps/site     │         │
│  │  Port: 3000     │  │  Port: 3001     │         │
│  │  Domain:        │  │  Domain:        │         │
│  │  admin.xxx.com  │  │  xxx.com        │         │
│  └─────────────────┘  └─────────────────┘         │
│           │                    │                    │
│           │                    │ WebSocket ✅       │
│           └────────┬───────────┘                    │
│                    │                                │
│           ┌────────▼────────┐                       │
│           │   MongoDB       │                       │
│           │   (Internal)    │                       │
│           └─────────────────┘                       │
│                                                     │
└─────────────────────────────────────────────────────┘
         │                         │
         ▼                         ▼
  Cloudflare CDN           Cloudflare CDN
  (Cache statique)         (Cache statique)
```

### Pourquoi PAS Vercel

| Critère | Northflank | Vercel |
|---------|------------|--------|
| **WebSocket** | ✅ Natif | ❌ Limited (timeout 10s/60s) |
| **Monorepo** | ✅ Simple | ⚠️ Complexe (workspaces) |
| **Coût** | ✅ Prévisible | ⚠️ Surprises (invocations) |
| **MongoDB** | ✅ Co-localisé | ❌ Distant (latence) |
| **Contrôle** | ✅ Total | ⚠️ Limité (serverless) |

---

## 📦 Configuration Northflank

### 1. Prérequis

```bash
# Installer Northflank CLI
npm install -g @northflank/cli

# Login
northflank login
```

### 2. Variables d'Environnement

#### apps/admin (.env.production)

```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/coworking-cafe

# NextAuth
NEXTAUTH_URL=https://admin.coworkingcafe.com
NEXTAUTH_SECRET=<généré avec: openssl rand -base64 32>

# JWT
JWT_SECRET=<généré avec: openssl rand -base64 32>

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=admin@coworkingcafe.com

# Uploads (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Node
NODE_ENV=production
```

#### apps/site (.env.production)

```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/coworking-cafe

# NextAuth
NEXTAUTH_URL=https://www.coworkingcafe.com
NEXTAUTH_SECRET=<même secret que admin>

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=contact@coworkingcafe.com

# Uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# WebSocket
NEXT_PUBLIC_WS_URL=wss://www.coworkingcafe.com

# Node
NODE_ENV=production
```

### 3. Dockerfile (Monorepo-aware)

#### Dockerfile.admin

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/
COPY packages/*/package.json packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build admin app
RUN pnpm --filter @coworking-cafe/admin build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app
COPY --from=base /app/apps/admin/.next ./apps/admin/.next
COPY --from=base /app/apps/admin/public ./apps/admin/public
COPY --from=base /app/apps/admin/package.json ./apps/admin/
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

EXPOSE 3000

CMD ["pnpm", "--filter", "@coworking-cafe/admin", "start"]
```

#### Dockerfile.site

```dockerfile
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/site/package.json apps/site/
COPY packages/*/package.json packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build site app
RUN pnpm --filter @coworking-cafe/site build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app
COPY --from=base /app/apps/site/.next ./apps/site/.next
COPY --from=base /app/apps/site/public ./apps/site/public
COPY --from=base /app/apps/site/package.json ./apps/site/
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

EXPOSE 3001

CMD ["pnpm", "--filter", "@coworking-cafe/site", "start"]
```

### 4. northflank.yaml (Infrastructure as Code)

```yaml
apiVersion: v1
kind: Project
metadata:
  name: coworking-cafe
spec:
  services:
    # Admin Dashboard
    - name: admin
      type: deployment
      build:
        dockerfile: Dockerfile.admin
        context: .
      runtime:
        port: 3000
        healthcheck:
          path: /api/health
          initialDelaySeconds: 30
      resources:
        requests:
          cpu: 500m
          memory: 512Mi
        limits:
          cpu: 1000m
          memory: 1Gi
      scaling:
        minReplicas: 1
        maxReplicas: 3
      domains:
        - name: admin.coworkingcafe.com
          path: /
      env:
        - name: MONGODB_URI
          secretRef: mongodb-uri
        - name: NEXTAUTH_SECRET
          secretRef: nextauth-secret
        # ... autres variables

    # Site Public + Dashboard Client
    - name: site
      type: deployment
      build:
        dockerfile: Dockerfile.site
        context: .
      runtime:
        port: 3001
        healthcheck:
          path: /api/health
          initialDelaySeconds: 30
        websocket: true  # ← CRITIQUE pour messaging
      resources:
        requests:
          cpu: 1000m
          memory: 1Gi
        limits:
          cpu: 2000m
          memory: 2Gi
      scaling:
        minReplicas: 2
        maxReplicas: 5
      domains:
        - name: coworkingcafe.com
          path: /
        - name: www.coworkingcafe.com
          path: /
      env:
        - name: MONGODB_URI
          secretRef: mongodb-uri
        - name: STRIPE_SECRET_KEY
          secretRef: stripe-secret
        # ... autres variables

    # MongoDB
    - name: mongodb
      type: managed-database
      spec:
        engine: mongodb
        version: "7.0"
        plan: standard-2gb
        backups:
          enabled: true
          schedule: "0 2 * * *"  # 2AM daily
      resources:
        storage: 20Gi
```

### 5. API Health Check

Créer dans chaque app pour le healthcheck Northflank:

#### apps/admin/src/app/api/health/route.ts

```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@coworking-cafe/database';

export async function GET() {
  try {
    // Vérifier connexion DB
    await connectDB();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'admin',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

#### apps/site/src/app/api/health/route.ts

```typescript
import { NextResponse } from 'next/server';
import { connectDB } from '@coworking-cafe/database';

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'site',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

---

## 🔄 Workflow CI/CD

### 1. GitHub Actions (Déploiement Automatique)

`.github/workflows/deploy-admin.yml`:

```yaml
name: Deploy Admin to Northflank

on:
  push:
    branches:
      - main
    paths:
      - 'apps/admin/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Northflank
        uses: northflank/deploy-action@v1
        with:
          api-token: ${{ secrets.NORTHFLANK_API_TOKEN }}
          project-id: coworking-cafe
          service-id: admin
```

`.github/workflows/deploy-site.yml`:

```yaml
name: Deploy Site to Northflank

on:
  push:
    branches:
      - main
    paths:
      - 'apps/site/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Northflank
        uses: northflank/deploy-action@v1
        with:
          api-token: ${{ secrets.NORTHFLANK_API_TOKEN }}
          project-id: coworking-cafe
          service-id: site
```

### 2. Pipeline de Déploiement

```bash
# 1. Push sur main
git push origin main

# 2. GitHub Actions déclenché automatiquement
# - Détecte les changements (apps/admin ou apps/site)
# - Build Docker image
# - Push vers Northflank Registry

# 3. Northflank
# - Pull nouvelle image
# - Rolling update (zero-downtime)
# - Health check avant de basculer traffic
# - Rollback auto si health check fail

# 4. Vérification manuelle
curl https://admin.coworkingcafe.com/api/health
curl https://www.coworkingcafe.com/api/health
```

---

## 🔐 Sécurité

### 1. Secrets Management

**Ne JAMAIS commit**:
- `.env.local`
- `.env.production`
- `*.key`, `*.pem`

**Stocker dans Northflank Secrets**:
```bash
northflank secret create \
  --project coworking-cafe \
  --name mongodb-uri \
  --value "mongodb://..."

northflank secret create \
  --project coworking-cafe \
  --name stripe-secret \
  --value "sk_live_..."
```

### 2. Webhooks Stripe

**Stripe Dashboard** → **Webhooks** → **Add endpoint**:

```
URL: https://www.coworkingcafe.com/api/webhooks/stripe
Events:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - payment_intent.canceled
  - checkout.session.completed
```

**Récupérer le webhook secret** → Ajouter à Northflank Secrets

### 3. CORS Configuration

```typescript
// apps/site/middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const origin = request.headers.get('origin');

  // Autoriser uniquement domaines connus
  const allowedOrigins = [
    'https://coworkingcafe.com',
    'https://www.coworkingcafe.com',
    'https://admin.coworkingcafe.com',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return NextResponse.next({
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return NextResponse.next();
}
```

---

## 📊 Monitoring & Analytics

### 1. Logs Centralisés

```bash
# Voir logs en temps réel
northflank logs --service admin --follow
northflank logs --service site --follow

# Filtrer par niveau
northflank logs --service site --level error
```

### 2. Monitoring Core Web Vitals

**Plausible Analytics** (privacy-friendly, self-hostable):

```typescript
// apps/site/src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script
          defer
          data-domain="coworkingcafe.com"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Lighthouse CI (Performance)

`.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://www.coworkingcafe.com
            https://www.coworkingcafe.com/espaces
            https://www.coworkingcafe.com/blog
          uploadArtifacts: true
```

---

## 🚨 Rollback & Disaster Recovery

### 1. Rollback Manuel

```bash
# Lister les déploiements
northflank deployment list --service site

# Rollback vers version précédente
northflank deployment rollback \
  --service site \
  --deployment-id <previous-deployment-id>
```

### 2. Backup MongoDB

```bash
# Backup manuel
northflank backup create \
  --service mongodb \
  --name "backup-$(date +%Y%m%d)"

# Restore
northflank backup restore \
  --service mongodb \
  --backup-id <backup-id>
```

### 3. Auto-scaling Rules

```yaml
# northflank.yaml
scaling:
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: cpu
      targetAverageUtilization: 70
    - type: memory
      targetAverageUtilization: 80
```

---

## 🎯 Checklist Pré-déploiement

### Apps

- [ ] **Build local réussi**
  ```bash
  pnpm --filter @coworking-cafe/admin build
  pnpm --filter @coworking-cafe/site build
  ```

- [ ] **Tests passés** (si tests existants)
  ```bash
  pnpm test
  ```

- [ ] **Variables d'environnement configurées** dans Northflank Secrets

- [ ] **Healthcheck endpoints créés** (`/api/health`)

### DNS

- [ ] **Domain pointé vers Northflank**
  - `coworkingcafe.com` → A record ou CNAME
  - `www.coworkingcafe.com` → CNAME
  - `admin.coworkingcafe.com` → CNAME

- [ ] **SSL/TLS configuré** (Let's Encrypt auto via Northflank)

### Webhooks

- [ ] **Stripe webhooks configurés**
  - URL: `https://www.coworkingcafe.com/api/webhooks/stripe`
  - Secret stocké dans Northflank

### Monitoring

- [ ] **Google Search Console** vérifié
- [ ] **Google Analytics** configuré
- [ ] **Plausible** installé (ou alternative)
- [ ] **Sentry** configuré (error tracking - optionnel)

---

## 📚 Ressources

- [Northflank Documentation](https://northflank.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas vs Self-hosted](https://www.mongodb.com/cloud/atlas/efficiency)
- [WebSocket on Northflank](https://northflank.com/docs/v1/application/websockets)

---

**Dernière mise à jour**: 21 janvier 2026
**Architecture décidée**: Tout sur Northflank (WebSocket support)
