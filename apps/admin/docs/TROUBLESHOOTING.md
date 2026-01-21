# TROUBLESHOOTING.md - Guide de Dépannage

> Documentation des problèmes courants et leurs solutions
> **Version** : 1.0
> **Dernière mise à jour** : 2026-01-21

---

## Table des matières

1. [Problèmes courants](#problèmes-courants)
2. [Erreurs MongoDB](#erreurs-mongodb)
3. [Erreurs NextAuth](#erreurs-nextauth)
4. [Problèmes de performance](#problèmes-de-performance)
5. [Debug des APIs](#debug-des-apis)

---

## Problèmes courants

### 1. Build qui échoue

#### Symptôme
```bash
pnpm build
# Error: Type error: Cannot find module '@/types/...'
```

#### Causes possibles
- Import TypeScript invalide
- Fichier manquant dans `/types/`
- Path mapping incorrect dans `tsconfig.json`

#### Solution

```bash
# 1. Vérifier que le fichier existe
ls -la src/types/

# 2. Vérifier les imports
grep -r "from '@/types/" src/

# 3. Vérifier tsconfig.json
cat tsconfig.json | grep "@"
# → Doit contenir: "@/*": ["./src/*"]

# 4. Nettoyer et rebuild
rm -rf .next
pnpm install
pnpm build
```

---

### 2. Page blanche après déploiement

#### Symptôme
- La page charge mais reste blanche
- Console : `Uncaught Error: Minified React error #...`

#### Causes possibles
- Erreur JavaScript en production (code minifié)
- Composant qui crash au render
- Hook mal utilisé (useEffect, useState)

#### Solution

```bash
# 1. Consulter les logs Vercel
# Dashboard Vercel > Logs > Filter "error"

# 2. Reproduire en local avec build production
pnpm build
pnpm start
# → Tester la page qui crash

# 3. Vérifier la console navigateur (F12)
# → Identifier le composant qui crash

# 4. Ajouter error boundary si nécessaire
```

**Exemple Error Boundary** :

```typescript
// components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6">
          <h2 className="text-xl font-bold">Oups ! Une erreur est survenue</h2>
          <p className="text-muted-foreground mt-2">
            {this.state.error?.message || 'Erreur inconnue'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Utilisation** :

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

### 3. Variables d'environnement non chargées

#### Symptôme
```bash
# Console
Error: MONGODB_URI is not defined
```

#### Causes possibles
- Fichier `.env.local` manquant
- Variables Vercel non configurées
- Préfixe `NEXT_PUBLIC_` manquant (pour variables client)

#### Solution

```bash
# 1. Vérifier fichier .env.local (dev)
cat .env.local
# → Doit contenir MONGODB_URI=...

# 2. Vérifier variables Vercel (prod)
# Dashboard Vercel > Settings > Environment Variables

# 3. Redémarrer le serveur local
# Ctrl+C puis:
pnpm dev

# 4. Pour variables client (accès navigateur)
# Ajouter préfixe NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.example.com
```

**⚠️ ATTENTION** :
- Variables **serveur** : Accessibles dans API Routes, Server Components
- Variables **client** : Besoin du préfixe `NEXT_PUBLIC_`, accessibles partout

**Exemple** :

```typescript
// ✅ Variable serveur (API Route)
export async function GET() {
  const uri = process.env.MONGODB_URI // OK
}

// ❌ Variable serveur dans composant client
'use client'
export function MyComponent() {
  const uri = process.env.MONGODB_URI // undefined
}

// ✅ Variable client
'use client'
export function MyComponent() {
  const url = process.env.NEXT_PUBLIC_API_URL // OK
}
```

---

### 4. Infinite render loop

#### Symptôme
- La page se rafraîchit en boucle
- Console : Memory leak warnings
- CPU à 100%

#### Causes possibles
- `useEffect` sans dépendances correctes
- State update dans render
- Re-création de fonction à chaque render

#### Solution

```typescript
// ❌ MAUVAIS - Infinite loop
function MyComponent() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData().then(setData)
  }) // Pas de dépendances → Boucle infinie
}

// ✅ BON - Dépendances vides (exécute 1 fois)
function MyComponent() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData().then(setData)
  }, []) // Exécute 1 fois au mount
}

// ❌ MAUVAIS - Fonction re-créée à chaque render
function MyComponent() {
  const fetchData = async () => { /* ... */ }

  useEffect(() => {
    fetchData()
  }, [fetchData]) // fetchData change à chaque render → Boucle
}

// ✅ BON - useCallback
function MyComponent() {
  const fetchData = useCallback(async () => {
    /* ... */
  }, []) // Fonction stable

  useEffect(() => {
    fetchData()
  }, [fetchData]) // OK
}
```

---

## Erreurs MongoDB

### 1. Connection timeout

#### Symptôme
```bash
MongoServerError: connection timed out
```

#### Causes possibles
- IP non autorisée dans MongoDB Atlas
- MONGODB_URI invalide
- Connexion réseau bloquée

#### Solution

```bash
# 1. Vérifier la connexion
curl https://cloud.mongodb.com
# → Doit retourner une page HTML

# 2. Vérifier MONGODB_URI
echo $MONGODB_URI
# Format attendu:
# mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# 3. MongoDB Atlas → Network Access
# Ajouter l'IP de Vercel (ou 0.0.0.0/0 pour autoriser toutes les IPs)

# 4. Tester la connexion en local
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
client.connect()
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err))
  .finally(() => client.close());
"
```

---

### 2. Authentication failed

#### Symptôme
```bash
MongoServerError: Authentication failed
```

#### Causes possibles
- Username/password incorrect dans MONGODB_URI
- Caractères spéciaux non encodés dans le mot de passe

#### Solution

```bash
# 1. Vérifier credentials MongoDB Atlas
# Dashboard Atlas > Database Access > Users

# 2. Encoder les caractères spéciaux du mot de passe
# Exemple: p@ssw0rd! → p%40ssw0rd%21

# JavaScript:
node -e "console.log(encodeURIComponent('p@ssw0rd!'))"
# → p%40ssw0rd%21

# 3. Mettre à jour MONGODB_URI avec le mot de passe encodé
MONGODB_URI=mongodb+srv://user:p%40ssw0rd%21@cluster.mongodb.net/...
```

---

### 3. Too many connections

#### Symptôme
```bash
MongoServerError: Too many connections
```

#### Causes possibles
- Connexions MongoDB non fermées
- Pool de connexions mal configuré
- `connectMongoose()` appelé dans boucle

#### Solution

```typescript
// ✅ BON - Réutiliser la connexion
// lib/mongodb.ts
import mongoose from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Limite les connexions
    }

    cached.promise = mongoose.connect(process.env.MONGODB_URI!, opts)
      .then(mongoose => mongoose)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// ❌ MAUVAIS - Nouvelle connexion à chaque appel
export async function connectMongoose() {
  await mongoose.connect(process.env.MONGODB_URI!) // Ne réutilise pas
}
```

---

### 4. Slow queries (> 100ms)

#### Symptôme
- Pages lentes à charger
- MongoDB Atlas > Performance Advisor : Slow queries detected

#### Causes possibles
- Pas d'index sur les champs filtrés
- Requête avec `.find()` sans limite
- Population excessive (`.populate()`)

#### Solution

```typescript
// ❌ MAUVAIS - Requête sans index
const employees = await Employee.find({ email: 'test@example.com' })
// → Full collection scan si pas d'index sur email

// ✅ BON - Créer un index
// models/employee/document.ts
EmployeeSchema.index({ email: 1 }) // Index sur email

// ❌ MAUVAIS - Pas de limite
const employees = await Employee.find({})
// → Peut retourner 10,000 documents

// ✅ BON - Limiter les résultats
const employees = await Employee.find({}).limit(100)

// ❌ MAUVAIS - Population excessive
const bookings = await Booking.find().populate('client').populate('space')
// → N+1 queries

// ✅ BON - Projection + limite
const bookings = await Booking.find()
  .populate('client', 'firstName lastName') // Seulement les champs nécessaires
  .limit(50)
```

**Créer des index manuellement** :

```bash
# MongoDB Shell
use coworking-cafe

# Index simple
db.employees.createIndex({ email: 1 })

# Index composé
db.timeEntries.createIndex({ employeeId: 1, date: -1 })

# Index unique
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## Erreurs NextAuth

### 1. Session undefined après login

#### Symptôme
```typescript
const session = await getServerSession(authOptions)
console.log(session) // null
```

#### Causes possibles
- `NEXTAUTH_SECRET` manquant ou changé
- `NEXTAUTH_URL` incorrect
- Cookies bloqués par le navigateur

#### Solution

```bash
# 1. Vérifier variables d'environnement
echo $NEXTAUTH_SECRET  # Doit exister
echo $NEXTAUTH_URL     # https://admin.coworkingcafe.fr

# 2. Regénérer NEXTAUTH_SECRET si perdu
openssl rand -base64 32

# 3. Vérifier les cookies (F12 > Application > Cookies)
# → Doit contenir: next-auth.session-token

# 4. Tester en navigation privée (pour éliminer problème cookies)

# 5. Vérifier authOptions (app/api/auth/[...nextauth]/route.ts)
```

**Exemple authOptions valide** :

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logique d'authentification
        const user = await User.findOne({ email: credentials?.email })
        if (user && await user.comparePassword(credentials?.password)) {
          return { id: user.id, email: user.email, role: user.role }
        }
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

### 2. CSRF token mismatch

#### Symptôme
```bash
[next-auth][error][CSRF_TOKEN_MISMATCH]
```

#### Causes possibles
- `NEXTAUTH_URL` incorrect (http vs https)
- Redirection entre domaines
- Cookies SameSite bloqués

#### Solution

```bash
# 1. Vérifier NEXTAUTH_URL
echo $NEXTAUTH_URL
# → Doit correspondre EXACTEMENT à l'URL visitée (http/https)

# 2. En dev, utiliser http://localhost:3001
NEXTAUTH_URL=http://localhost:3001

# 3. En prod, utiliser https://
NEXTAUTH_URL=https://admin.coworkingcafe.fr

# 4. Vider cache navigateur et cookies
# F12 > Application > Clear site data
```

---

### 3. Callback URL error

#### Symptôme
```bash
[next-auth][error][CALLBACK_URL_ERROR]
```

#### Causes possibles
- URL de callback non autorisée
- Domaine différent entre login et callback

#### Solution

```typescript
// authOptions
export const authOptions: AuthOptions = {
  // ...
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Autoriser uniquement redirections internes
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}
```

---

## Problèmes de performance

### 1. Time To First Byte (TTFB) élevé

#### Symptôme
- Lighthouse : TTFB > 2s
- Page lente à charger même avec connexion rapide

#### Causes possibles
- Requêtes MongoDB lentes (voir section MongoDB)
- Pas de cache sur les données statiques
- API Routes trop lourdes

#### Solution

```typescript
// 1. Ajouter cache Next.js
export const revalidate = 60 // Revalider toutes les 60 secondes

// 2. Utiliser React Cache pour requests multiples
import { cache } from 'react'

const getEmployees = cache(async () => {
  return await Employee.find({ isActive: true })
})

// 3. Lazy load des composants lourds
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Désactiver SSR si pas nécessaire
})

// 4. Limiter les données retournées
const employees = await Employee.find()
  .select('id firstName lastName email') // Seulement les champs nécessaires
  .limit(100)
```

---

### 2. Bundle JavaScript trop gros

#### Symptôme
- Lighthouse : Large bundle size warning
- Page lente en 3G/4G

#### Causes possibles
- Bibliothèques lourdes importées partout
- Pas de code splitting
- Images non optimisées

#### Solution

```bash
# 1. Analyser le bundle
pnpm add -D @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})

# Analyser
ANALYZE=true pnpm build

# 2. Code splitting automatique Next.js
# → Utiliser dynamic imports

# 3. Optimiser les images
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  priority // Pour images above-the-fold
/>
```

---

## Debug des APIs

### Activer les logs détaillés

```typescript
// lib/api/debug.ts
export function debugLog(endpoint: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Debug] ${endpoint}`, {
      timestamp: new Date().toISOString(),
      data: JSON.stringify(data, null, 2)
    })
  }
}

// Utilisation dans API Route
import { debugLog } from '@/lib/api/debug'

export async function GET(request: Request) {
  debugLog('GET /api/employees', { params: request.url })

  try {
    const employees = await Employee.find()
    debugLog('GET /api/employees', { count: employees.length })
    return successResponse(employees)
  } catch (error) {
    console.error('[API Error] GET /api/employees', error)
    return errorResponse('Erreur serveur', error.message)
  }
}
```

---

### Tester les APIs avec curl

```bash
# 1. Test GET simple
curl https://admin.coworkingcafe.fr/api/hr/employees

# 2. Test avec authentification (copier cookie depuis navigateur)
curl -H "Cookie: next-auth.session-token=xxx" \
  https://admin.coworkingcafe.fr/api/hr/employees

# 3. Test POST avec données
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=xxx" \
  -d '{"firstName":"John","lastName":"Doe"}' \
  https://admin.coworkingcafe.fr/api/hr/employees

# 4. Test avec verbose (voir headers)
curl -v https://admin.coworkingcafe.fr/api/hr/employees
```

---

### Postman / Insomnia

**Collection Postman recommandée** :

```json
{
  "name": "Admin API",
  "requests": [
    {
      "name": "Login",
      "method": "POST",
      "url": "https://admin.coworkingcafe.fr/api/auth/callback/credentials",
      "body": {
        "email": "admin@example.com",
        "password": "password"
      }
    },
    {
      "name": "Get Employees",
      "method": "GET",
      "url": "https://admin.coworkingcafe.fr/api/hr/employees",
      "auth": "inherit"
    }
  ]
}
```

---

## Checklist Debug Général

Quand quelque chose ne fonctionne pas :

1. **Reproduire le problème**
   - [ ] Identifier les étapes exactes
   - [ ] Vérifier si c'est en dev/prod/les deux

2. **Consulter les logs**
   - [ ] Console navigateur (F12)
   - [ ] Logs Vercel (production)
   - [ ] Logs serveur local (terminal)

3. **Isoler la cause**
   - [ ] Tester en navigation privée
   - [ ] Vider cache/cookies
   - [ ] Tester avec compte différent
   - [ ] Tester API directement (curl/Postman)

4. **Documenter**
   - [ ] Ajouter bug dans [BUGS.md](./maintenance/BUGS.md)
   - [ ] Noter la solution trouvée
   - [ ] Mettre à jour ce fichier si problème fréquent

---

## Ressources

- **Vercel Logs** : https://vercel.com/dashboard/[project]/logs
- **MongoDB Atlas** : https://cloud.mongodb.com/
- **Next.js Debugging** : https://nextjs.org/docs/advanced-features/debugging
- **React DevTools** : Chrome Extension
- **Guide BUGS** : [BUGS.md](./maintenance/BUGS.md)

---

_Documentation maintenue par l'équipe CoworKing Cafe_
