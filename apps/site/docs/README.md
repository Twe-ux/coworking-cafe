# 📚 Documentation apps/site

> Documentation technique du projet apps/site (CoworKing Café)

---

## 📂 Structure

```
docs/
├── README.md                    # Ce fichier
├── components/                  # Documentation composants
│   ├── USE_BOOKING_FORM.md     # Hook useBookingForm
│   ├── BLOG_COMPONENTS.md      # Composants blog
│   └── PAGES_MARKETING.md      # Pages marketing
├── phases/                      # Documentation phases terminées
│   ├── PHASE5_COMPLETE.md      # Récap Phase 5
│   ├── PROGRESS_PHASE_5_AGENT_1.md
│   ├── PHASE_5_AGENT_1_FILES.txt
│   └── PHASE_5_DASHBOARD.md    # Dashboard client
└── agents/                      # Logs agents temporaires
    ├── IMPLEMENTATION.md        # Détails implémentation
    └── COMPOSANTS_CREES.md      # Liste composants créés
```

---

## 📖 Documents Principaux (Racine)

À la racine de `apps/site/`:

- **`CLAUDE.md`** - Configuration et instructions pour Claude Code (114KB)
  - Stack technique
  - Conventions de code strictes
  - Workflow développement
  - Architecture monorepo
  - Guide migration

- **`TODO.md`** - Liste des tâches et progression (18KB)
  - 7 phases de développement
  - Progression: 94.4% (17/18 jours)
  - Checklist détaillée

- **`WORKFLOW.md`** - Workflow général de développement

---

## 🎨 Documentation Composants

### `components/USE_BOOKING_FORM.md`
- Documentation complète du hook `useBookingForm`
- 14 règles de validation
- API integration
- Result pattern
- Exemples d'usage

### `components/BLOG_COMPONENTS.md`
- ArticleCard, ArticleList
- CommentSection, CommentForm
- Architecture composants blog

### `components/PAGES_MARKETING.md`
- Pages marketing (home, concept, spaces, pricing)
- Structure et conventions

---

## 📋 Documentation Phases

### `phases/PHASE5_COMPLETE.md`
Récapitulatif complet Phase 5 (Dashboard Client):
- 27 fichiers créés
- 4,378 lignes de code
- 3 agents parallèles
- Layout, Réservations, Profil, Paramètres

### `phases/PHASE_5_DASHBOARD.md`
- Architecture dashboard
- Composants créés
- APIs utilisées

---

## 🤖 Logs Agents

### `agents/IMPLEMENTATION.md`
- Détails d'implémentation par agents
- Décisions techniques
- Problèmes résolus

### `agents/COMPOSANTS_CREES.md`
- Liste exhaustive composants créés
- Hiérarchie et dépendances
- Stats par agent

---

## 🔗 Liens Rapides

- **Code source**: `/apps/site/src/`
- **Components**: `/apps/site/src/components/`
- **Pages**: `/apps/site/src/app/`
- **Styles**: `/apps/site/src/styles/`
- **Types**: `/apps/site/src/types/`

---

## 🎯 Conventions

- **ZÉRO `any` types** - TypeScript strict
- **Fichiers < 200 lignes** - Découpage modulaire
- **SCSS BEM modifié** - `.page-name__element--modifier`
- **Dates en string** - `YYYY-MM-DD`, `HH:mm`
- **SEO metadata** - Sur toutes les pages
- **Next/image** - Pour toutes les images

---

**Dernière mise à jour**: 21 janvier 2026
**Progression globale**: 94.4% (Phases 0-6 terminées)
