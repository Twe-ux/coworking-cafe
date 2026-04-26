---
name: redesign
description: Lance le mode multi-agent pour le redesign UI d'une page ou d'un module. Analyse le handoff de référence (claude_code_handoff/design_reference/05_v2_dark_editorial/), compare avec le code existant, planifie les tâches et spawne les agents Sonnet. À utiliser pour tout redesign de page ou feature multi-fichiers basé sur un handoff.
---

# Redesign — Mode Multi-Agent UI Handoff

**Announce at start:** "Je lance le mode Redesign — analyse handoff + agents Sonnet."

## Rôle du Team Lead (toi)

Tu es le **Team Lead**. Tu analyses, planifies, délègues et reviews. Tu n'implémentes pas directement — les agents Sonnet s'en chargent.

## Workflow obligatoire

### Phase 1 — Analyse (Team Lead)

1. Lire les fichiers de référence pertinents :
   - Design handoff : `claude_code_handoff/design_reference/05_v2_dark_editorial/<page>.html`
   - Composants partagés : `claude_code_handoff/design_reference/05_v2_dark_editorial/shared.jsx`
   - Icônes : `claude_code_handoff/design_reference/05_v2_dark_editorial/icons.jsx`
   - Tokens CSS : `claude_code_handoff/design_reference/05_v2_dark_editorial/tokens.css`
   - Spec du projet : `apps/site-v2/CLAUDE.md`
   - Code existant : fichiers actuels de la page/feature concernée
   - Plan d'avancement : `apps/site-v2/docs/plans/MASTER_PLAN.md`

2. Identifier les écarts :
   - Composants manquants ou à créer
   - Composants existants à corriger (design, textes, ordre)
   - APIs à brancher (`@coworking-cafe/database`, Stripe, NextAuth)
   - Dépendances entre tâches

### Phase 2 — Plan (Team Lead)

Créer une équipe et des tâches atomiques :

```
TeamCreate name="<feature-name>" description="<description>"

TaskCreate subject="<Composant A>" description="<détail précis>" activeForm="Creating <A>"
TaskCreate subject="<Composant B>" description="<détail précis>" activeForm="Creating <B>"
...
```

**Règles de découpage des tâches :**
- ✅ Auto-contenu — 1 tâche = 1 composant ou 1 hook ou 1 page
- ✅ Testable — critères d'acceptation clairs
- ✅ < 200 lignes attendues par fichier produit (composants), < 250 (hooks), < 150 (pages)
- ✅ Dépendances explicites si nécessaires (blockedBy)

**Format description d'une tâche :**
```
Implémenter <NomComposant> en suivant le design :
claude_code_handoff/design_reference/05_v2_dark_editorial/<page>.html

Référence composants partagés : 
claude_code_handoff/design_reference/05_v2_dark_editorial/shared.jsx

Route/emplacement : apps/site-v2/src/components/<dossier>/<NomComposant>.tsx
(ou apps/site-v2/src/app/(site)/<page>/page.tsx)

Stack : Next.js 15 App Router, Tailwind v4 CSS-first, React 19, TypeScript 5

Design tokens (globals.css) :
- --body: #1A1A1A (fond dark, texte)
- --main: #417972 (sauge — accent)
- --btn:  #F2D381 (miel — CTA primaires)
- --cream: #FAF6EE (fond pages claires)
- --line: #E8E2D4 (bordures)
- --gry:  #7A766B (texte secondaire)

Typographie :
- font-serif → Fraunces (titres)
- font-sans  → Inter (body)
- font-mono  → JetBrains Mono (tags, labels, eyebrow)

Exigences :
- Design fidèle au handoff HTML de référence
- Mobile-first (375px → 760px → 1200px)
- TypeScript strict (0 any, 0 as casting non justifié)
- Fichier < 200 lignes (composant) / < 150 (page)
- Couleurs uniquement via tokens design, pas de couleurs inventées
- Pas d'emoji dans le produit final

Checklist avant de marquer completed :
- [ ] pnpm --filter @coworking-cafe/site-v2 type-check → 0 erreur
- [ ] pnpm --filter @coworking-cafe/site-v2 lint → 0 erreur
- [ ] Design vérifié visuellement vs handoff HTML
- [ ] Responsive vérifié (mobile 375px + desktop 1200px)
```

### Phase 3 — Exécution parallèle (workers Sonnet)

Spawner 3-4 agents en parallèle pour les tâches sans dépendances :

```
Agent(subagent_type="general-purpose", model="sonnet", name="worker-1",
  prompt="[contexte complet + tâche + checklist]")
Agent(subagent_type="general-purpose", model="sonnet", name="worker-2",
  prompt="[contexte complet + tâche + checklist]")
```

**Chaque prompt d'agent DOIT contenir :**
- Le contexte projet (stack, conventions CLAUDE.md de apps/site-v2/)
- Le chemin absolu du fichier handoff HTML à lire
- La tâche précise à accomplir
- Les critères d'acceptation
- La commande de validation (`pnpm --filter @coworking-cafe/site-v2 type-check && pnpm --filter @coworking-cafe/site-v2 lint`)

### Phase 4 — Review (Team Lead)

Pour chaque tâche complétée, auditer avec cette grille :

```markdown
## Audit <NomComposant>

### Design fidélité
- [ ] Couleurs conformes aux tokens (--body #1A1A1A, --main #417972, --btn #F2D381, --cream #FAF6EE)
- [ ] Typographie correcte (Fraunces serif titres, Inter sans body, JetBrains Mono labels)
- [ ] Spacing/radius conformes au handoff (cards 20px, boutons pill, inputs 12px)
- [ ] Accents français présents (é, è, à, ê, î, ç, œ)

### Code quality
- [ ] 0 `any` types
- [ ] Fichier < 200 lignes (composant) / < 150 (page) / < 250 (hook)
- [ ] Mobile-first (pas de desktop-first inversé)
- [ ] Hooks extraits si logique complexe (composant > 100 lignes)
- [ ] Server Component par défaut, "use client" uniquement si nécessaire

### Technique
- [ ] pnpm --filter @coworking-cafe/site-v2 type-check → 0 erreur
- [ ] pnpm --filter @coworking-cafe/site-v2 lint → 0 erreur
- [ ] Pas de couleurs en dur hors tokens
- [ ] Imports corrects (@/components, @/lib, @/types, @/hooks)
```

Si non-conforme → créer une task de correction et réassigner.
Si conforme → valider et passer à la suite.

### Phase 5 — Clôture

```
TeamDelete  # Nettoyer l'équipe une fois toutes les tâches validées
```

Mettre à jour `apps/site-v2/docs/plans/MASTER_PLAN.md` :
- Cocher les items ✅ complétés
- Lister les fichiers créés avec leur nb de lignes

## Quand utiliser ce skill

✅ Redesign / implémentation d'une page entière (auth, booking, dashboard...)
✅ Feature multi-composants (> 3 fichiers) basée sur le handoff HTML
✅ Travail parallélisable (composants indépendants)

❌ Bug fix < 3 fichiers → mode direct
❌ Édition < 50 lignes → mode direct
❌ Feature sans handoff → utiliser `/writing-plans` générique

## Références projet

```
claude_code_handoff/design_reference/05_v2_dark_editorial/
├── landing.html       → /
├── espaces.html       → /espaces
├── tarifs.html        → /tarifs
├── concept.html       → /concept
├── menu.html          → /menu
├── evenements.html    → /evenements
├── dashboard.html     → /dashboard (desktop)
├── shared.jsx         → Nav, PageHeader, Footer
├── icons.jsx          → ~45 icônes SVG
└── tokens.css         → variables CSS de référence

claude_code_handoff/
├── 01_auth.html       → /login, /register, /reset
├── 02_booking_flow.html → /booking
└── 03_dashboard_mobile.html → /dashboard (mobile/PWA)

apps/site-v2/src/
├── app/(site)/        → pages publiques (Nav+Footer)
├── app/(auth)/        → pages auth (layout minimal)
├── app/booking/       → flow réservation
├── app/dashboard/     → espace membre (protégé)
├── components/ui/     → Button, Card, Chip, Icon, Sheet
├── components/layout/ → Nav, Footer, PageHeader, NavWrapper
├── types/             → space.ts, pricing.ts, evenement.ts...
└── lib/               → cn.ts, fonts.ts, auth.ts, stripe.ts
```
