# Guide de Developpement

> Conventions et bonnes pratiques pour developper sur l'application admin.
> **Derniere mise a jour** : 2026-01-20

---

## Conventions de Code

### TypeScript

- **Zero `any`** : Toujours typer explicitement
- Utiliser les types partages depuis `/types/`
- Interface pour objets, type pour unions

```typescript
// BON
import type { Employee } from '@/types/hr'

// MAUVAIS
const data: any = await fetch(...)
```

### Taille des Fichiers

| Type | Max lignes | Action si depasse |
|------|------------|-------------------|
| Composants React | 200 | Extraire sous-composants |
| Custom Hooks | 150 | Separer en hooks specialises |
| Pages Next.js | 150 | Logique vers hooks |
| API Routes | 200 | Extraire validation/logique |

### Formats de Dates

**TOUJOURS des strings** pour les dates en API :

```typescript
// BON
{
  date: "2026-01-16",    // YYYY-MM-DD
  clockIn: "09:00",      // HH:mm
}

// MAUVAIS
{
  date: new Date("2026-01-16T00:00:00.000Z")  // Bugs timezone
}
```

---

## Securite

### Protection des Routes API

Toutes les routes doivent utiliser `requireAuth()` :

```typescript
import { requireAuth } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin'])
  if (!authResult.authorized) {
    return authResult.response
  }

  // Logique metier...
}
```

### Roles

| Role | Acces |
|------|-------|
| `dev` | Complet + Debug |
| `admin` | Gestion complete |
| `staff` | Lecture HR/Planning |

---

## Commandes Utiles

```bash
# Developpement
pnpm dev

# Type check
pnpm type-check
# ou
pnpm exec tsc --noEmit

# Build
pnpm build

# Lint
pnpm lint
```

---

## Voir Aussi

- [CLAUDE.md](/apps/admin/CLAUDE.md) - Regles completes
- [API_ROUTES.md](../architecture/API_ROUTES.md) - Documentation API
- [TESTING_CHECKLIST.md](../testing/TESTING_CHECKLIST.md) - Tests

---

*Consulter CLAUDE.md pour les regles detaillees.*
