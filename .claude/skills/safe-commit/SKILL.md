---
name: safe-commit
description: Commit sécurisé — exécute obligatoirement la review des fichiers modifiés et les tests avant tout commit. Bloque si l'un des deux échoue. Usage : /safe-commit "message de commit"
---

# Safe Commit — Commit Gated par Review + Tests

**Usage :** `/safe-commit "feat: mon message de commit"`

**Announce at start :** "Je lance Safe Commit — Gate 1 (review) → Gate 2 (tests) → Commit."

---

## Principe

**AUCUN commit ne peut être créé sans avoir franchi les deux gates.**

```
GATE 1 : Review des fichiers modifiés    → DOIT être ✅
GATE 2 : Type-check + Lint               → DOIT être ✅
                    ↓
              git commit
```

Si l'un des deux gates échoue → **STOP**. Lister les problèmes. Ne pas committer.

---

## Workflow

### Gate 1 — Review des fichiers modifiés

**1.1 — Lister les fichiers changés et identifier l'app concernée**

```bash
git diff --name-only HEAD
git diff --cached --name-only
```

Grouper par app (`apps/site`, `apps/site-v2`, `apps/admin`, `packages/*`).
Identifier les apps distinctes impactées pour adapter les commandes.

**1.2 — Review rapide par dossier**

Pour chaque dossier contenant des modifications, appliquer la grille suivante sur les fichiers changés **uniquement** (pas le dossier entier) :

**Checklist review par fichier modifié :**

```
□ TypeScript — 0 `any` introduit
□ TypeScript — pas de `as` casting non justifié
□ Taille — dans les limites (Composants ≤200L, Hooks ≤250L, Pages ≤150L, Services/Utils ≤200L)
□ Conventions — nommage cohérent, imports groupés (externes → internes → types)
□ Tailwind — pas de couleurs hardcodées (hex, rgb) — utiliser les classes Tailwind
□ 'use client' — présent uniquement si état/événements JS nécessaires (Server Components par défaut)
□ Pas de code mort — ancienne logique supprimée si remplacée
□ Pas de console.log / debugs oubliés
□ Secrets — aucun secret en dur (toujours process.env.XXX)
□ Dates — format string YYYY-MM-DD / HH:mm (jamais new Date().toISOString())
□ Gestion d'erreurs — try/catch ou Result pattern sur les opérations async
```

**1.3 — Résultat Gate 1**

Si au moins un ❌ : **Gate 1 ÉCHOUÉ**
```
❌ GATE 1 ÉCHOUÉ — Review bloquante

Problèmes détectés :
• fichier.tsx:42 — `any` détecté → corriger avant commit
• BigComponent.tsx — 247L (limite 200L) → splitter

Corrige ces points puis relance /safe-commit.
```
→ STOP. Ne pas passer au Gate 2.

Si tout ✅ : **Gate 1 PASSÉ** → continuer.

---

### Gate 2 — Type-check + Lint

Détecter l'app concernée et exécuter dans l'ordre :

```bash
# Si modifications dans apps/site-v2/
pnpm --filter @coworking-cafe/site-v2 type-check
pnpm --filter @coworking-cafe/site-v2 lint

# Si modifications dans apps/site/
pnpm --filter @coworking-cafe/site type-check
pnpm --filter @coworking-cafe/site lint

# Si modifications dans apps/admin/
pnpm --filter @coworking-cafe/admin type-check
pnpm --filter @coworking-cafe/admin lint

# Si modifications dans packages/
pnpm --filter @coworking-cafe/[package] type-check

# Si modifications dans plusieurs apps → exécuter pour chaque app impactée
```

**Note :** Les tests E2E (Playwright) ne bloquent pas le commit — ils sont exécutés en CI.

**Résultat Gate 2 :**

Si erreurs TS ou lint : **Gate 2 ÉCHOUÉ**
```
❌ GATE 2 ÉCHOUÉ — Qualité bloquante

Type-check : 3 erreurs
  src/components/X.tsx:12 — Property 'foo' does not exist
  ...

Lint : 2 erreurs
  ...

Corrige ces erreurs puis relance /safe-commit.
```
→ STOP. Ne pas committer.

Si tout passe : **Gate 2 PASSÉ** → continuer.

---

### Commit

Les deux gates sont verts. Créer le commit avec le message fourni en argument.

**Format du message (Conventional Commits) :**
```
<type>(<scope>): <description>

[body optionnel]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Types acceptés : `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`

Scopes courants : `site`, `site-v2`, `admin`, `booking`, `auth`, `email`, `database`, `shared`

**Staging :**
- Ne stager que les fichiers revus (pas de `git add -A` aveugle)
- Exclure : `.env`, `.env.local`, fichiers de credentials, binaires non intentionnels

```bash
# Vérifier avant de stager
git diff --stat
git status

# Stager les fichiers pertinents
git add <fichiers spécifiques>

# Créer le commit
git commit -m "$(cat <<'EOF'
<message fourni en argument>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

**Confirmation finale :**
```
✅ COMMIT CRÉÉ

Gate 1 (Review)  : ✅ X fichiers analysés, 0 bloquant
Gate 2 (Quality) : ✅ type-check OK · lint OK
Commit           : <hash> <message>
Fichiers         : X changed, Y insertions(+), Z deletions(-)
```

---

## Règles strictes

**Ne JAMAIS committer si :**
- Un `any` a été introduit dans les fichiers modifiés
- Un fichier dépasse sa limite de lignes
- `type-check` retourne des erreurs
- `lint` retourne des erreurs (warnings tolérés avec justification)
- Des secrets sont en dur dans le code

**Toujours :**
- Lire les fichiers avant de les reviewer (pas d'hypothèses)
- Exécuter les commandes et lire la sortie complète (pas de "devrait passer")
- Stager fichier par fichier (pas `git add -A`)

---

## Cas d'usage

```bash
# Nouvelle feature site-v2
/safe-commit "feat(site-v2): add auth middleware and login page"

# Fix booking
/safe-commit "fix(booking): correct special requests saving in webhook"

# Refacto composant
/safe-commit "refactor(site-v2): extract nav into reusable component"

# Chore
/safe-commit "chore: update dependencies"
```

## Quand NE PAS utiliser

❌ WIP commit (travail en cours) → utiliser `git stash` ou commit direct
❌ Hotfix d'urgence déjà validé manuellement → commit direct
❌ Merge commit automatique → git gère seul

## Relation avec /review

`/safe-commit` fait une **review ciblée** sur les fichiers modifiés uniquement (rapide).
`/review <dossier>` fait une **review exhaustive** d'un dossier entier (approfondie).

Pour une feature complète : `/review apps/site-v2/src/components/` → `/safe-commit "feat: ..."`
