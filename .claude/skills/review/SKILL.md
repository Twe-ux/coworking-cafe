---
name: review
description: Analyse complète d'un dossier — bonnes pratiques TypeScript, conventions projet, refacto suggérée, composants réutilisables, splits nécessaires, conformité architecture hexagonale et design system C&B.
---

# Review — Analyse Complète de Dossier

**Usage :** `/review <chemin>`
**Exemple :** `/review src/components/landing/` ou `/review src/app/(dashboard)/`

---

## Rôle

Tu es un **Code Reviewer senior**. Tu analyses le dossier indiqué en argument de façon exhaustive et produis un rapport structuré avec des recommandations actionnables.

Tu **lis le code**, tu **ne le modifies pas**. Seul le rapport compte.

---

## Workflow

### Étape 1 — Inventaire

Lister tous les fichiers du dossier cible :
- Nombre de fichiers, types (`.tsx`, `.ts`, `.css`…)
- Lignes par fichier (via `wc -l`)
- Identifier immédiatement les fichiers dépassant les limites

### Étape 2 — Analyse parallèle (Explore agents)

Spawner 2–3 agents Explore en parallèle selon la taille du dossier :

```
Agent(subagent_type="Explore", prompt="Analyse <aspect> dans <chemin>...")
```

**Répartition suggérée :**
- **Agent A** — TypeScript & qualité code (any, types, logique)
- **Agent B** — Architecture & conventions (imports, hexagonal, hooks)
- **Agent C** — UI/Design & réutilisabilité (composants, design tokens)

### Étape 3 — Synthèse et rapport

Consolider les résultats dans le rapport ci-dessous.

---

## Grille d'analyse

### 🔴 Bloquants (à corriger avant merge)
Problèmes qui cassent les règles critiques du projet.

**TypeScript**
- [ ] Présence de `any` → fichier + ligne
- [ ] `as` casting sans validation préalable
- [ ] `@ts-ignore` / `@ts-expect-error` non justifiés
- [ ] Types manquants sur les fonctions exportées

**Taille de fichiers (limites CLAUDE.md)**
| Type | Limite | Fichiers dépassant |
|------|--------|-------------------|
| Composants React | 200 lignes | — |
| Hooks | 250 lignes | — |
| Pages Next.js | 50 lignes | — |
| Use Cases | 150 lignes | — |
| Routers tRPC | 200 lignes | — |

**Architecture hexagonale**
- [ ] `core/` n'importe pas `infrastructure/` ou `server/`
- [ ] Use Cases utilisent Result Pattern (pas de `throw`)
- [ ] Repositories n'importent pas Prisma directement dans `core/`

### 🟡 Améliorations (recommandées)

**Composants réutilisables identifiés**
Lister les patterns dupliqués qui pourraient être extraits :
```
→ [NomSuggéré] — présent dans X fichiers — extraire vers src/components/ui/
→ [NomHook] — logique répétée — extraire vers src/hooks/
```

**Splits suggérés**
Pour chaque fichier > 80% de sa limite :
```
→ [fichier.tsx] (180L / 200L) — extraire [sousComposant] (~60L)
```

**Conventions**
- [ ] Mobile-first respecté (pas de desktop-first inversé)
- [ ] Nommage cohérent (PascalCase composants, camelCase hooks, kebab-case fichiers)
- [ ] `'use client'` uniquement quand nécessaire (état, événements)
- [ ] Imports groupés : externes → internes → types → styles
- [ ] Pas d'imports circulaires

**Design System C&B**
- [ ] Tokens utilisés (`cb-teal`, `cb-gold`, `cb-blue-deep`, `cb-ink`) vs valeurs hardcodées
- [ ] Fonts correctes (`font-display` Agbalumo, `font-mono` JetBrains, `font-sans` Inter)
- [ ] Pas de couleurs `gray-*` en dark mode (→ `white/*` opacity)
- [ ] Animations via classes utilitaires (`animate-cb-*`) plutôt qu'inline JS

### 🟢 Points positifs
Ce qui est bien fait et à maintenir.

---

## Format du rapport final

```markdown
# Review — [dossier analysé]
Date : [date]
Fichiers analysés : X | Total lignes : Y

---

## 🔴 Bloquants ([N] items)

### TypeScript
- `fichier.tsx:42` — `any` détecté sur `const data: any`
  → Correction : `const data: UserData = ...`

### Taille
- `BigComponent.tsx` — 247L (limite 200L)
  → Extraire `<SubSection>` (~70L) + `<ItemCard>` (~50L)

---

## 🟡 Recommandations ([N] items)

### Composants réutilisables
- Pattern "badge KPI" dupliqué dans 3 fichiers
  → Créer `src/components/ui/kpi-badge.tsx`

### Splits
- `HeroSection.tsx` (188L) proche de la limite
  → Extraire `<HeroCTA>` pour anticiper la croissance

### Conventions
- `StorySection.tsx:15` — couleur hardcodée `#0c889c`
  → Remplacer par `text-cb-teal` ou `var(--cb-teal)`

---

## 🟢 Positif
- 0 `any` dans 8/10 fichiers ✓
- Mobile-first respecté partout ✓
- Result Pattern correctement utilisé ✓

---

## Actions prioritaires (ordre suggéré)

1. [ ] Corriger les `any` dans `fichier.tsx`
2. [ ] Splitter `BigComponent.tsx`
3. [ ] Extraire le composant réutilisable `KpiBadge`
4. [ ] Remplacer les couleurs hardcodées par tokens

---

## Score global

| Critère | Score |
|---------|-------|
| TypeScript strict | 8/10 |
| Taille fichiers | 7/10 |
| Architecture | 10/10 |
| Design System | 6/10 |
| Réutilisabilité | 7/10 |
| **Global** | **7.6/10** |
```

---

## Règles du reviewer

- **Être précis** : toujours citer fichier + numéro de ligne
- **Être actionnable** : chaque problème → correction suggérée concrète
- **Prioriser** : bloquants d'abord, optimisations ensuite
- **Être honnête** : noter aussi ce qui est bien fait
- **Ne pas modifier le code** : rapport uniquement

## Quand utiliser ce skill

✅ Avant un merge dans `main`
✅ Après avoir implémenté une feature (auto-review)
✅ Pour auditer un dossier legacy avant refacto
✅ Pour valider le travail d'un agent Sonnet

❌ Pour une review de fichier unique → lire directement
❌ Pour corriger le code → utiliser `/opusplan` ou mode direct
