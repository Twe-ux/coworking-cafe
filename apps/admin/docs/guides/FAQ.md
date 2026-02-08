# FAQ - Questions Fréquentes

Réponses aux questions courantes lors du développement.

## 📁 Organisation & Structure

### "Où mettre ce nouveau fichier ?"

**→ Consulte [ARCHITECTURE.md](./ARCHITECTURE.md)**

Résumé rapide :
- **Composants UI** → `/components/ui/`
- **Composants métier** → `/components/[module]/`
- **Hooks** → `/hooks/`
- **Types** → `/types/`
- **Models** → `/models/[model]/` (structure modulaire)
- **API routes** → `/app/api/[module]/`
- **Pages admin** → `/app/(dashboard)/(admin)/[module]/`

---

## 🎨 TypeScript & Types

### "Comment typer cette donnée ?"

1. **Cherche d'abord dans `/types/`** si le type existe déjà
2. Si non, crée un nouveau type partagé
3. **Jamais de `any`** - prends 2 min pour typer correctement

**Voir [TYPES_GUIDE.md](./TYPES_GUIDE.md)**

### "Interface ou Type ?"

```typescript
// ✅ BON - Interfaces pour objets
interface Employee {
  id: string
  name: string
}

// ✅ BON - Types pour unions, primitives
type EmployeeStatus = 'active' | 'inactive'
```

---

## 🔒 Sécurité & Auth

### "Cette API doit-elle être protégée ?"

**OUI**, sauf ces exceptions :
- `/api/auth/[...nextauth]`
- `/api/hr/employees/verify-pin`
- `/api/time-entries/clock-in`
- `/api/time-entries/clock-out`

**Voir [SECURITY.md](./SECURITY.md)**

### "Quel rôle utiliser ?"

```typescript
// Lecture (tous)
requireAuth(['dev', 'admin', 'staff'])

// Écriture (admin only)
requireAuth(['dev', 'admin'])

// Debug (dev only)
requireAuth(['dev'])
```

### "Rôle système vs rôle métier ?"

```typescript
// ✅ BON - Rôle système (auth)
requireAuth(['dev', 'admin', 'staff'])

// ✅ BON - Rôle métier (RH)
employee.employeeRole === 'Manager'

// ❌ MAUVAIS - Confusion
requireAuth(['Manager']) // ❌ Manager n'est pas un rôle système
```

---

## 📅 Dates & Heures

### "Format Date ou string ?"

**→ TOUJOURS string** (YYYY-MM-DD, HH:mm)

```typescript
// ❌ INTERDIT
{ date: new Date().toISOString() }

// ✅ CORRECT
{ date: "2026-01-16", clockIn: "09:00" }
```

**Voir [CONVENTIONS.md](./CONVENTIONS.md)**

---

## 📏 Taille des Fichiers

### "Ce composant fait 300 lignes, c'est grave ?"

**OUI** - Limite 200 lignes pour composants.

**Solution** :
1. Extraire logique dans un hook custom
2. Découper en sous-composants
3. Créer des composants UI réutilisables

**Exemple** :

```typescript
// ❌ MAUVAIS (300 lignes)
export function EmployeeList() {
  // 100 lignes de logique
  // 100 lignes de JSX
}

// ✅ BON
// hooks/useEmployeeList.ts (80 lignes)
export function useEmployeeList() { }

// components/EmployeeList.tsx (120 lignes)
export function EmployeeList() {
  const { employees, loading } = useEmployeeList()
  if (loading) return <Skeleton />
  return <EmployeeTable employees={employees} />
}
```

---

## 🎨 Composants & UI

### "Dois-je créer un skeleton loader ?"

**OUI** - Obligatoire pour toutes les pages dashboard.

**Voir [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md)**

### "Comment rendre un composant réutilisable ?"

```typescript
// ❌ MAUVAIS - Composants dupliqués
<HeroOne />
<HeroTwo />

// ✅ BON - Composant flexible
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>
```

---

## 🌐 API Routes

### "Structure d'une route API ?"

```typescript
export async function GET(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response

  // 2. DB Connection
  await connectMongoose()

  // 3. Logic
  try {
    const data = await Model.find()
    return successResponse(data)
  } catch (error) {
    console.error('[Route] Error:', error)
    return errorResponse('Message friendly', error.message)
  }
}
```

**Voir [API_GUIDE.md](./API_GUIDE.md)**

### "Quel status code utiliser ?"

- **200** - GET réussi
- **201** - POST réussi (création)
- **204** - DELETE réussi
- **400** - Erreur validation
- **401** - Non authentifié
- **403** - Permission refusée
- **404** - Ressource introuvable
- **500** - Erreur serveur

---

## 🔄 Migration depuis /apps/site

### "Puis-je copier-coller le code ?"

**NON** - C'est une **RÉÉCRITURE** complète.

**Pourquoi ?**
- Éliminer `any` types
- Découper fichiers trop gros
- Appliquer les conventions strictes
- Utiliser Tailwind au lieu de Bootstrap

**Voir [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**

### "Comment gérer les APIs partagées ?"

Deux options :
1. **Package database** (préféré)
2. **Maintenir compatibilité** (même structure dans les deux apps)

---

## 🐛 Debugging

### "Comment déboguer une erreur API ?"

```bash
# 1. Console browser (F12)
# Voir l'erreur + status code

# 2. Logs serveur (terminal)
# Voir console.error() côté serveur

# 3. Network tab (F12)
# Voir request/response complets

# 4. Vérifier MongoDB
# Données bien enregistrées ?
```

### "Erreur TypeScript mais je ne comprends pas ?"

```bash
# Voir l'erreur complète
pnpm exec tsc --noEmit

# Lire l'erreur de bas en haut
# → Elle pointe souvent vers la vraie cause
```

---

## ✅ Checklist & Tests

### "Que tester avant de commit ?"

```bash
# 1. Types
pnpm exec tsc --noEmit

# 2. Build
pnpm build

# 3. Tests manuels (5 min)
# - Login
# - Feature testée
# - Console propre
# - BD mise à jour
```

**Voir [TESTING.md](./TESTING.md)**

---

## 🚀 Performance

### "Comment optimiser les re-renders ?"

```typescript
// ✅ Mémoriser callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [dependency])

// ✅ Mémoriser valeurs calculées
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

---

## 📦 Dependencies

### "Puis-je ajouter une nouvelle librairie ?"

**Demander d'abord** si :
- Grosse librairie (> 100kb)
- Alternative native existe
- Usage ponctuel

**Installer** :
```bash
pnpm add [package]
pnpm add -D [package] # dev dependency
```

---

## 🔐 Secrets & Env Variables

### "Où mettre les secrets ?"

```bash
# ✅ Fichier .env.local (jamais commité)
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_live_...

# ✅ Dans le code
const uri = process.env.MONGODB_URI!

# ❌ JAMAIS en dur
const uri = "mongodb+srv://admin:PASSWORD@..."
```

---

## 📚 Documentation

### "Comment documenter une nouvelle feature ?"

1. **Code commenté** (JSDoc sur fonctions publiques)
2. **Types clairs** (noms explicites)
3. **README** si module complexe
4. **Mise à jour docs/** si nouveau pattern

---

## 💡 Besoin d'Aide ?

### "Je suis bloqué, que faire ?"

1. **Lire la doc** correspondante dans `/docs/`
2. **Chercher dans le code existant** (patterns similaires)
3. **Vérifier les exemples** mentionnés dans les docs
4. **Demander** si toujours bloqué

### "J'ai trouvé un bug dans la doc ?"

**Corriger et commit** ! La doc doit être à jour.

---

## 📖 Liens Rapides

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Structure projet
- [CONVENTIONS.md](./CONVENTIONS.md) - Règles de code
- [SECURITY.md](./SECURITY.md) - Auth & sécurité
- [API_GUIDE.md](./API_GUIDE.md) - Patterns API
- [COMPONENTS_GUIDE.md](./COMPONENTS_GUIDE.md) - Composants React
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration depuis site
- [TYPES_GUIDE.md](./TYPES_GUIDE.md) - Types partagés
- [TESTING.md](./TESTING.md) - Tests manuels
