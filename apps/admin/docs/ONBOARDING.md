# ONBOARDING.md - Guide d'Intégration Développeur

> Documentation pour démarrer rapidement sur le projet admin
> **Version** : 1.0
> **Dernière mise à jour** : 2026-01-21

---

## Table des matières

1. [Setup environnement de dev](#setup-environnement-de-dev)
2. [Architecture du projet](#architecture-du-projet)
3. [Où trouver quoi](#où-trouver-quoi)
4. [Conventions de code](#conventions-de-code)
5. [Premier commit](#premier-commit)

---

## Setup environnement de dev

### Prérequis

**Logiciels requis** :

- **Node.js** : v18+ ([Download](https://nodejs.org/))
- **pnpm** : v8+ (package manager)
  ```bash
  npm install -g pnpm
  ```
- **Git** : Version récente
- **MongoDB Compass** : Pour visualiser la DB (optionnel)
- **VS Code** : Recommandé (ou autre IDE)

**Comptes nécessaires** :

- Accès au repo GitHub : `github.com/thierry/coworking-cafe`
- Accès MongoDB Atlas (demander au lead dev)
- Accès Vercel Dashboard (optionnel)

---

### Installation (30 min)

#### 1. Cloner le repo

```bash
# Clone
cd ~/Developer
git clone https://github.com/thierry/coworking-cafe.git
cd coworking-cafe

# Vérifier la structure
ls -la
# → apps/admin, apps/site, packages/, CLAUDE.md
```

#### 2. Installer les dépendances

```bash
# Root (installe TOUT le monorepo)
pnpm install

# → Installation de 1000+ packages (~5 min)
```

#### 3. Configurer les variables d'environnement

```bash
# Aller dans apps/admin
cd apps/admin

# Créer .env.local (copier depuis .env.example si existe)
touch .env.local

# Éditer avec ton éditeur
code .env.local
# ou
nano .env.local
```

**Variables minimales pour dev** :

```bash
# MongoDB (demander URI au lead dev)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coworking-cafe-dev?retryWrites=true&w=majority

# NextAuth (générer avec: openssl rand -base64 32)
NEXTAUTH_SECRET=ton-secret-genere-ici
NEXTAUTH_URL=http://localhost:3001

# Email (optionnel en dev, demander clé)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=dev@coworkingcafe.fr

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

**Générer NEXTAUTH_SECRET** :

```bash
openssl rand -base64 32
# → Copier le résultat dans .env.local
```

#### 4. Seed la base de données (optionnel)

```bash
# Créer les rôles par défaut (dev, admin, staff)
pnpm seed-roles

# Créer un utilisateur admin de test
pnpm create-admin
# → Suivre les instructions
# Email: dev@test.com
# Password: DevTest123!
```

#### 5. Lancer le serveur

```bash
# Dev mode (hot reload)
pnpm dev

# → Server démarré sur http://localhost:3001
```

**Tester l'installation** :

1. Ouvrir http://localhost:3001
2. Login avec le compte créé (dev@test.com / DevTest123!)
3. Vérifier que le dashboard s'affiche
4. Ouvrir la console (F12) → Pas d'erreurs

✅ Si tout fonctionne → Installation réussie !

---

### VS Code - Extensions recommandées

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

**Installer rapidement** :

```bash
# Ouvrir VS Code
code .

# Notification : "Install recommended extensions" → Cliquer "Install All"
```

---

### Configuration VS Code

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

**Créer le fichier si absent** :

```bash
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
EOF
```

---

## Architecture du projet

### Vue d'ensemble (5 min)

**Structure monorepo** :

```
/coworking-cafe/
├── apps/
│   ├── admin/              ← Tu travailles ICI
│   ├── site/               ← Site public (autre équipe)
│   └── socket-server/      ← WebSocket (notifications)
├── packages/
│   ├── database/           ← Models Mongoose partagés
│   ├── shared/             ← Utilitaires communs
│   └── email/              ← Templates emails
├── CLAUDE.md               ← Conventions monorepo
└── package.json            ← Root workspace
```

---

### Architecture apps/admin (10 min)

```
/apps/admin/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (dashboard)/        # Layout dashboard
│   │   │   ├── (admin)/        # Routes admin/dev (protégées)
│   │   │   │   ├── hr/         # Ressources Humaines
│   │   │   │   ├── accounting/ # Comptabilité
│   │   │   │   └── ...
│   │   │   └── (staff)/        # Routes staff (lecture seule)
│   │   │       └── clocking/   # Pointage employés
│   │   ├── (errors)/           # Pages erreur (404, 403, 401, 500)
│   │   ├── api/                # API Routes
│   │   │   ├── hr/             # APIs RH
│   │   │   ├── accounting/     # APIs Comptabilité
│   │   │   ├── auth/           # NextAuth
│   │   │   └── ...
│   │   └── login/              # Page de connexion
│   │
│   ├── components/             # Composants React
│   │   ├── ui/                 # shadcn/ui base
│   │   ├── layout/             # Header, Sidebar, Nav
│   │   ├── hr/                 # Composants RH
│   │   └── ...
│   │
│   ├── lib/                    # Utilitaires
│   │   ├── api/                # Helpers API (auth, response)
│   │   ├── pdf/                # Génération PDF
│   │   └── utils/              # Utilitaires généraux
│   │
│   ├── hooks/                  # Custom hooks React
│   ├── types/                  # Types TypeScript partagés
│   └── models/                 # Mongoose models (structure modulaire)
│
├── docs/                       # Documentation
├── public/                     # Assets statiques
├── CLAUDE.md                   # Conventions de code (LIRE EN PREMIER)
└── package.json
```

---

### Concepts clés Next.js 14

**App Router** : Routing basé sur fichiers

```
src/app/admin/hr/employees/page.tsx
→ URL: /admin/hr/employees
```

**Server vs Client Components** :

```typescript
// ✅ Server Component (défaut)
export default function EmployeesPage() {
  // Peut accéder à la DB directement
  const employees = await Employee.find()
  return <div>...</div>
}

// ✅ Client Component (interaction)
'use client'
export function EmployeeForm() {
  const [name, setName] = useState('')
  return <form>...</form>
}
```

**API Routes** :

```
src/app/api/hr/employees/route.ts
→ URL: /api/hr/employees
→ Méthodes: GET, POST, PUT, DELETE
```

---

## Où trouver quoi

### Tu veux...

**Créer une nouvelle page** :
- `src/app/(dashboard)/(admin)/[section]/[page]/page.tsx`
- Exemple : `src/app/(dashboard)/(admin)/booking/calendar/page.tsx`

**Créer une API** :
- `src/app/api/[section]/[endpoint]/route.ts`
- Exemple : `src/app/api/booking/reservations/route.ts`

**Créer un composant réutilisable** :
- `src/components/[section]/[ComponentName].tsx`
- Exemple : `src/components/booking/BookingCard.tsx`

**Créer un custom hook** :
- `src/hooks/[hookName].ts`
- Exemple : `src/hooks/useBookings.ts`

**Ajouter/modifier un type** :
- `src/types/[section].ts`
- Exemple : `src/types/booking.ts`

**Créer/modifier un model Mongoose** :
- `src/models/[modelName]/` (structure modulaire)
- Voir `src/models/employee/` pour exemple

**Ajouter un helper/utilitaire** :
- `src/lib/[category]/[helper].ts`
- Exemple : `src/lib/api/auth.ts`

---

### Fichiers importants à connaître

| Fichier | Description |
|---------|-------------|
| `CLAUDE.md` | **LIRE EN PREMIER** - Conventions strictes |
| `docs/README.md` | Index de la documentation |
| `docs/DEPLOYMENT.md` | Guide de déploiement |
| `docs/TROUBLESHOOTING.md` | Problèmes courants |
| `src/lib/api/auth.ts` | Helper authentification `requireAuth()` |
| `src/lib/api/response.ts` | Helpers réponses API |
| `src/types/` | Types TypeScript partagés |
| `src/models/` | Models Mongoose |

---

## Conventions de code

**⚠️ LIRE OBLIGATOIREMENT** : `/apps/admin/CLAUDE.md`

### Résumé rapide (5 min)

#### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) {}

// ✅ CORRECT
interface EmployeeData {
  id: string
  firstName: string
}
function handleData(data: EmployeeData) {}
```

#### 2. Dates - TOUJOURS des strings

```typescript
// ❌ INTERDIT
{ date: new Date() }

// ✅ CORRECT
{ date: "2026-01-21" }    // YYYY-MM-DD
{ time: "09:30" }          // HH:mm
```

#### 3. Fichiers - Max 200 lignes

Si un fichier dépasse 200 lignes → Découper

```typescript
// Composant trop gros (300 lignes)
// → Extraire logique dans hook
// → Extraire sous-composants
```

#### 4. APIs - Toujours protégées

```typescript
import { requireAuth } from '@/lib/api/auth'

export async function GET(request: Request) {
  // 1. Auth OBLIGATOIRE (sauf exceptions)
  const auth = await requireAuth(['dev', 'admin'])
  if (!auth.authorized) return auth.response

  // 2. Logique
  // ...
}
```

#### 5. Imports - Utiliser types partagés

```typescript
// ❌ INTERDIT - Interface locale
interface Employee { ... }

// ✅ CORRECT - Import depuis types partagés
import type { Employee } from '@/types/hr'
```

---

### Checklist avant commit

```bash
# 1. Type check
pnpm type-check
# → 0 erreurs TypeScript

# 2. Lint (optionnel)
pnpm lint

# 3. Build
pnpm build
# → Doit réussir

# 4. Test manuel
pnpm dev
# → Tester la feature ajoutée
```

---

## Premier commit

### Exercice : Ajouter une page "About"

**Objectif** : Créer une page `/admin/about` simple pour tester le workflow.

#### Étape 1 : Créer la page

```bash
# Créer le dossier
mkdir -p src/app/\(dashboard\)/\(admin\)/about

# Créer la page
cat > src/app/\(dashboard\)/\(admin\)/about/page.tsx << 'EOF'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

export default async function AboutPage() {
  // Protection de la page
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">À propos</h1>
        <p className="text-muted-foreground mt-2">
          Dashboard admin du CoworKing Café
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Informations</h2>
        <ul className="space-y-2">
          <li><strong>Version :</strong> 1.0.0</li>
          <li><strong>Framework :</strong> Next.js 14</li>
          <li><strong>UI :</strong> shadcn/ui + Tailwind CSS</li>
          <li><strong>Database :</strong> MongoDB + Mongoose</li>
        </ul>
      </div>
    </div>
  )
}
EOF
```

#### Étape 2 : Tester

```bash
# Lancer le serveur
pnpm dev

# Ouvrir http://localhost:3001/admin/about
# → La page doit s'afficher
```

#### Étape 3 : Vérifier

```bash
# Type check
pnpm type-check
# ✅ No errors

# Build
pnpm build
# ✅ Compiled successfully
```

#### Étape 4 : Commit

```bash
# Status
git status
# → Modified: src/app/(dashboard)/(admin)/about/page.tsx

# Add
git add src/app/\(dashboard\)/\(admin\)/about/

# Commit
git commit -m "feat(admin): add about page"

# Push (si branche de travail)
git push origin feat/about-page
```

✅ **Félicitations !** Tu as fait ton premier commit.

---

## Workflow de développement

### Créer une nouvelle feature

```bash
# 1. Créer une branche
git checkout -b feat/booking-calendar

# 2. Développer
# → Créer composants, APIs, types, etc.
# → Respecter conventions CLAUDE.md

# 3. Tester
pnpm dev
# → Test manuel de la feature

# 4. Vérifier
pnpm type-check && pnpm build

# 5. Commit
git add .
git commit -m "feat(admin): add booking calendar"

# 6. Push
git push origin feat/booking-calendar

# 7. Créer une Pull Request sur GitHub
# → Attendre review
# → Merger si approuvé
```

---

### Corriger un bug

```bash
# 1. Créer une branche
git checkout -b fix/employee-form-validation

# 2. Reproduire le bug
# → Tester le scénario qui cause le bug

# 3. Corriger
# → Modifier le code

# 4. Vérifier
# → Re-tester le scénario
# → pnpm type-check && pnpm build

# 5. Documenter (optionnel)
# → Ajouter dans docs/maintenance/BUGS.md

# 6. Commit
git add .
git commit -m "fix(hr): validate employee form before submit"

# 7. Push et PR
git push origin fix/employee-form-validation
```

---

## Ressources

### Documentation interne

- **[CLAUDE.md](../CLAUDE.md)** - Conventions de code (OBLIGATOIRE)
- **[docs/README.md](./README.md)** - Index documentation
- **[docs/DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide déploiement
- **[docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Debug
- **[docs/testing/TESTING_CHECKLIST.md](./testing/TESTING_CHECKLIST.md)** - Tests manuels

### Documentation externe

- **[Next.js 14 Docs](https://nextjs.org/docs)** - Framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styles
- **[Mongoose](https://mongoosejs.com/docs/)** - MongoDB ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentification

### Contacts

- **Lead Dev** : [Email du lead]
- **Équipe** : [Slack/Discord channel]
- **Support** : [Email support technique]

---

## Checklist onboarding

**Avant de commencer à coder** :

- [ ] Node.js + pnpm installés
- [ ] Repo cloné et dépendances installées
- [ ] `.env.local` configuré
- [ ] Serveur démarre sans erreur (`pnpm dev`)
- [ ] Compte test créé et login fonctionne
- [ ] VS Code configuré avec extensions
- [ ] `CLAUDE.md` lu et compris
- [ ] Premier commit effectué (exercice About)
- [ ] Accès GitHub/MongoDB/Vercel configurés
- [ ] Contact lead dev établi

✅ **Prêt à coder !**

---

## Prochaines étapes

1. **Explorer le code**
   - Lire `src/app/api/hr/employees/route.ts` (exemple API)
   - Lire `src/components/hr/EmployeeCard.tsx` (exemple composant)
   - Lire `src/models/employee/` (exemple model modulaire)

2. **Prendre un ticket**
   - Demander au lead dev un ticket de démarrage
   - Idéalement : Bug fix simple ou petite feature

3. **Pair programming** (recommandé)
   - Faire les premiers commits en pair avec un dev senior
   - Poser des questions, comprendre les patterns

4. **Approfondir**
   - Lire documentation complète dans `/docs/`
   - Parcourir le code existant
   - Proposer des améliorations

---

## Aide

**Problème technique** :
- Consulter [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Chercher dans les issues GitHub
- Demander dans le channel dev

**Question sur le code** :
- Lire [CLAUDE.md](../CLAUDE.md)
- Regarder les exemples existants
- Demander code review

**Bloqué sur une feature** :
- Décrire le problème dans le channel
- Partager le code et l'erreur
- Proposer pair programming si besoin

---

**Bienvenue dans l'équipe ! 🚀**

_Documentation maintenue par l'équipe CoworKing Cafe_
