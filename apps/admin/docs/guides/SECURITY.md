# Sécurité & Authentification

Guide des pratiques de sécurité obligatoires.

## 🔒 Pattern d'Authentification

### Utiliser TOUJOURS le Helper `requireAuth()`

```typescript
// /app/api/hr/employees/route.ts
import { requireAuth } from '@/lib/api/auth'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
  // 1. Authentification OBLIGATOIRE
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response // 401 ou 403
  }

  // 2. Logique métier
  try {
    const employees = await Employee.find({ isActive: true })
    return successResponse(employees)
  } catch (error) {
    return errorResponse('Erreur serveur', error.message)
  }
}
```

---

## 👤 Rôles & Permissions

### Niveaux de Permissions

| Rôle | Accès | Usage |
|------|-------|-------|
| `dev` | Complet (admin + debug) | Développement uniquement |
| `admin` | Gestion complète | Admin système |
| `staff` | Lecture HR/Planning | Employé standard |

### Configuration par Opération

```typescript
// Lecture seule (tous les rôles)
requireAuth(['dev', 'admin', 'staff'])

// Écriture (admin seulement)
requireAuth(['dev', 'admin'])

// Debug/Dev (dev seulement)
requireAuth(['dev'])
```

---

## ⚠️ Distinction Rôles Système vs Rôles Métier

**IMPORTANT** : Ne pas confondre les deux types de rôles !

### 1. Rôles Système (Authentication)

Utilisés pour **l'authentification et les permissions d'accès** :

- `dev` - Développeur (accès complet)
- `admin` - Administrateur (gestion complète)
- `staff` - Employé (lecture seulement)

**Usage** : `requireAuth(['dev', 'admin', 'staff'])`

### 2. Rôles Métier RH (employeeRole)

Utilisés pour **la fonction dans l'entreprise** :

- `Manager` - Responsable d'équipe
- `Assistant manager` - Responsable adjoint
- `Employé polyvalent` - Employé standard

**Usage** : `employee.employeeRole === 'Manager'`

### Exemple de Confusion à Éviter

```typescript
// ❌ MAUVAIS - Confondre rôle système et rôle métier
requireAuth(['Manager']) // ❌ Manager n'est pas un rôle système

// ✅ BON - Utiliser le bon rôle
requireAuth(['dev', 'admin', 'staff']) // ✅ Rôles système
if (employee.employeeRole === 'Manager') { } // ✅ Rôle métier
```

---

## 🌐 Routes Publiques (Exceptions)

**Seules ces routes peuvent être publiques** :

- `/api/auth/[...nextauth]` - NextAuth endpoint
- `/api/hr/employees/verify-pin` - Vérification PIN pour pointage
- `/api/time-entries/clock-in` - Pointage entrée (avec PIN)
- `/api/time-entries/clock-out` - Pointage sortie (avec PIN)

**⚠️ Toutes les autres routes DOIVENT être protégées !**

---

## 🚨 RÈGLE CRITIQUE : Secrets et Documentation

### ⚠️ JAMAIS DE SECRETS EN DUR

```typescript
// ❌ INTERDIT - Secrets en dur dans le code
const mongoUri = "mongodb+srv://admin:REAL_PASSWORD@cluster.mongodb.net/db"
const stripeKey = "sk_live_51ABC..."

// ❌ INTERDIT - Secrets dans documentation .md
/**
 * Exemple :
 * MONGODB_URI=mongodb+srv://admin:REAL_PASSWORD@cluster.mongodb.net/db
 */

// ✅ CORRECT - Variables d'environnement
const mongoUri = process.env.MONGODB_URI!
const stripeKey = process.env.STRIPE_SECRET_KEY!

// ✅ CORRECT - Placeholders dans documentation
/**
 * Exemple :
 * MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE
 */
```

### Règles Strictes

- ✅ Toujours utiliser `process.env.XXX` pour les secrets
- ✅ Fichiers .md dans `/docs/` uniquement (pas à la racine)
- ✅ Placeholders génériques dans documentation (`PASSWORD`, `YOUR_SECRET`, `USERNAME`)
- ❌ JAMAIS de vrais credentials dans les .md
- ❌ JAMAIS de secrets committés dans Git
- ❌ JAMAIS de .md à la racine (sauf README, CHANGELOG, CLAUDE.md)

### Exemples de Secrets à JAMAIS Committer

- ❌ Passwords MongoDB/PostgreSQL
- ❌ Clés API (Stripe, Resend, Cloudinary, etc.)
- ❌ Tokens d'authentification
- ❌ Secrets NextAuth/JWT
- ❌ Clés privées (VAPID, SSH, etc.)
- ❌ Webhooks secrets

---

## 🔐 Checklist Avant Commit

```bash
# Vérifier qu'aucun secret n'est présent
git diff | grep -i "password\|secret\|key" | grep -v "PASSWORD\|SECRET\|KEY"
# → Ne doit rien afficher

# Pre-commit hook détecte automatiquement les secrets
git commit -m "..."
# Si bloqué → Vérifier et supprimer les secrets

# ⚠️ JAMAIS utiliser --no-verify sauf faux positif avéré
```

---

## 🛡️ Bonnes Pratiques Sécurité

### 1. Validation des Inputs

```typescript
// ✅ BON - Valider côté serveur
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) return authResult.response

  const body = await request.json()

  // Validation stricte
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse('Email invalide', 'Format email incorrect', 400)
  }

  // ...
}
```

### 2. Protection CSRF (Intégré NextAuth)

NextAuth protège automatiquement contre CSRF. Pas besoin de token CSRF manuel.

### 3. Rate Limiting (Recommandé)

```typescript
// TODO: Implémenter rate limiting avec upstash/ratelimit
// Pour protéger les endpoints sensibles (login, verify-pin, etc.)
```

### 4. Headers de Sécurité

```typescript
// next.config.js (si besoin de headers custom)
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}
```

---

## 🔍 Audit de Sécurité

### Checklist Périodique

- [ ] Toutes les routes API sont protégées (sauf exceptions)
- [ ] Aucun secret en dur dans le code
- [ ] `.env.local` dans `.gitignore`
- [ ] Pre-commit hook actif
- [ ] Validation inputs côté serveur
- [ ] Logs ne contiennent pas de données sensibles
- [ ] Dépendances à jour (`pnpm audit`)

---

**Voir aussi** :
- [API_GUIDE.md](./API_GUIDE.md) - Patterns API
- [CONVENTIONS.md](./CONVENTIONS.md) - Conventions générales
