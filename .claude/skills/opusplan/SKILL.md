---
name: opusplan
description: Lance le mode multi-agent générique — Team Lead (Opus) + workers (Sonnet). Analyse la demande, crée les tâches, spawne les agents et coordonne. À utiliser pour toute feature complexe ou tâche multi-fichiers dans le monorepo CoworKing Café.
---

# OpusPlan — Mode Team Lead Multi-Agent

**Announce at start:** "Je lance le mode OpusPlan — Team Lead + agents Sonnet."

## Rôle du Team Lead (toi)

Tu es le **Team Lead**. Tu analyses, planifies, délègues et reviews. Tu n'implémentes pas directement — les agents Sonnet s'en chargent.

---

## Workflow

### Phase 1 — Analyse

Avant de planifier, lire le contexte nécessaire :
- Code existant impacté par la demande
- CLAUDE.md de l'app concernée (`apps/site-v2/CLAUDE.md`, `apps/site/CLAUDE.md`, `apps/admin/CLAUDE.md`)
- Plan de phases si disponible (`apps/site-v2/docs/plans/MASTER_PLAN.md`)
- Design de référence si composant UI (`claude_code_handoff/design_reference/`)

Identifier :
- L'app concernée : `site-v2` / `site` / `admin` / packages partagés
- Les composants/modules à créer ou modifier
- Les dépendances entre tâches (quelles tâches bloquent quelles autres)
- Ce qui peut être parallélisé

### Phase 2 — Création des tâches

Utiliser la **team permanente** `coworking-team` (ne pas en créer une nouvelle sauf si elle n'existe pas encore) :

```
# Si la team n'existe pas encore
TeamCreate name="coworking-team" description="Team permanente CoworKing Café"

# Créer les tâches
TaskCreate subject="<Tâche A>" description="<détail précis>" activeForm="Doing A"
TaskCreate subject="<Tâche B>" description="<détail précis>" activeForm="Doing B"
```

**Règles de découpage :**
- ✅ 1 tâche = 1 unité livrable (composant, hook, page, API route, fichier)
- ✅ Critères d'acceptation explicites dans chaque description
- ✅ Dépendances indiquées si nécessaire
- ✅ Taille attendue : Composants ≤200L, Hooks ≤250L, Pages ≤150L, API routes ≤200L

**Règle Tests (adaptée au projet) :**

| Type de fichier | Test associé requis ? |
|-----------------|----------------------|
| Hook (`useXxx.ts`) avec logique métier complexe | ✅ Recommandé |
| Utilitaire / lib (`calendar.ts`, etc.) | ✅ Recommandé |
| API route avec validation Zod | ✅ Recommandé (test d'intégration) |
| Composant React | ❌ Couvert par Playwright E2E |
| Page Next.js | ❌ Couvert par Playwright E2E |

```
# Exemple avec test si logique complexe
TaskCreate subject="Impl — useBookingFlow"
TaskCreate subject="Tests — useBookingFlow"  # uniquement si logique métier

# Exemple sans test (composant UI)
TaskCreate subject="Impl — BookingStep1Form"
# Pas de task tests associée — couvert par E2E Playwright
```

### Phase 3 — Spawn des workers Sonnet (parallèle)

Pour les tâches indépendantes, spawner plusieurs agents simultanément :

```
Agent(subagent_type="general-purpose", model="sonnet", name="worker-1", prompt="...")
Agent(subagent_type="general-purpose", model="sonnet", name="worker-2", prompt="...")
```

**Chaque prompt d'agent doit contenir :**

```markdown
## Contexte projet
- Monorepo CoworKing Café — branche v2/site
- App : apps/site-v2/ (ou apps/site/ / apps/admin/)
- Stack : Next.js 15 App Router, React 19, TypeScript 5, Tailwind v4 CSS-first
- Règles : Lire apps/site-v2/CLAUDE.md avant de commencer

## Design System (si tâche UI)
Tokens CSS définis dans src/app/globals.css :
- --body: #1A1A1A | --main: #417972 | --btn: #F2D381
- --cream: #FAF6EE | --line: #E8E2D4 | --gry: #7A766B | --danger: #C0534C
- Polices : font-serif (Fraunces) / font-sans (Inter) / font-mono (JetBrains)
- NE PAS inventer de couleurs — utiliser les tokens uniquement

## Tâche
[Description précise de ce qui doit être implémenté]

## Fichiers de référence à lire
- [liste des fichiers existants pertinents]
- [design de référence si applicable]

## Critères d'acceptation
- [ ] [critère 1]
- [ ] [critère 2]
- [ ] pnpm --filter @coworking-cafe/[app] type-check → 0 erreur

## Règles strictes
- Zéro `any` TypeScript
- Dates : format string "YYYY-MM-DD" / "HH:mm" (jamais Date object)
- Secrets : uniquement process.env.XXX
- `"use client"` uniquement si état ou événements nécessaires
- Fichiers : Composants ≤200L, Hooks ≤250L, Pages ≤150L
```

### Phase 4 — Review (Team Lead)

Pour chaque tâche complétée par un worker, lire le(s) fichier(s) produit(s) et auditer :

```markdown
## Audit <Tâche> — <Nom Worker>

### ✅ Conformités
- [ ] Fonctionnellement correct (répond au besoin)
- [ ] TypeScript strict — 0 `any`
- [ ] Fichier dans les limites de taille
- [ ] Tokens CSS respectés (pas de hex hardcodé sauf transparences de tokens)
- [ ] `"use client"` justifié si présent
- [ ] Dates en format string
- [ ] Pas de secrets en dur
- [ ] pnpm --filter @coworking-cafe/[app] type-check → 0 erreur (ou 0 erreur nouvelle)

### ⚠️ Warnings (non-bloquants)
- [points d'amélioration mineurs]

### ❌ Non-Conformités (bloquants)
- [problèmes à corriger]
```

Si non-conforme → créer une task de correction, réassigner au worker.  
Si conforme → marquer la task `completed`.

### Phase 5 — Clôture

Quand toutes les tasks sont `completed` :

1. **Mettre à jour MASTER_PLAN.md** si la tâche s'inscrit dans une phase définie :
   - Cocher les items complétés dans `apps/site-v2/docs/plans/MASTER_PLAN.md`
   - Ajouter les composants/hooks créés dans la section de la phase

2. **Shutdown les workers actifs** (pas TeamDelete — la team `coworking-team` reste active) :
   ```
   SendMessage to="worker-1" type="shutdown_request"
   SendMessage to="worker-2" type="shutdown_request"
   ```

3. **Lancer `/safe-commit`** avec un message de commit conventionnel.

---

## Contexte projet (référence rapide)

| App | Package | Commande type-check | Port |
|-----|---------|---------------------|------|
| Site public V2 | `@coworking-cafe/site-v2` | `pnpm --filter @coworking-cafe/site-v2 type-check` | 3002 |
| Site public V1 | `@coworking-cafe/site` | `pnpm --filter @coworking-cafe/site type-check` | 3000 |
| Admin | `@coworking-cafe/admin` | `pnpm --filter @coworking-cafe/admin type-check` | 3001 |

**Phases site-v2 :**
| Phase | Domaine | Status |
|-------|---------|--------|
| 1 | Site public (6 pages) | ✅ DONE |
| 2 | Auth (login, register, reset) | ✅ DONE |
| 3 | Booking flow | 🔲 TODO |
| 4 | Dashboard membre (PWA) | 🔲 TODO |
| 5 | Intégrations backend | 🔲 TODO |

**Design de référence :**
```
claude_code_handoff/design_reference/05_v2_dark_editorial/
├── landing.html → /
├── espaces.html → /espaces
├── 01_auth.html → /login, /register, /reset
├── 02_booking_flow.html → /booking
└── 03_dashboard_mobile.html → /dashboard (mobile)
```

---

## Quand utiliser ce skill

✅ Feature multi-composants (> 3 fichiers à créer/modifier)  
✅ Travail parallélisable (modules indépendants)  
✅ Refactoring complexe touchant plusieurs couches  
✅ Implémentation d'une phase entière  

❌ Bug fix < 3 fichiers → mode direct  
❌ Édition < 50 lignes → mode direct  
❌ Page depuis un handoff design → utiliser `/redesign`  
❌ Review code → utiliser `/review`  
❌ Commit → utiliser `/safe-commit`
