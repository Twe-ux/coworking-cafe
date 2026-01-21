# 📚 Documentation CoworKing Café - Monorepo

Documentation technique complète du projet CoworKing Café.

---

## 📂 Organisation des Documents

### `/architecture/` - Architecture & Design

Documentation de l'architecture technique du monorepo :

- **ADMIN_ARCHITECTURE.md** - Architecture détaillée de l'app admin (dashboard RH/Comptabilité)
- **PACKAGES_ARCHITECTURE.md** - Architecture complète de `packages/database`
  - 33 models Mongoose centralisés
  - Schemas détaillés avec champs/types
  - Relations entre models
  - 30+ indexes critiques
  - Plan de migration en 5 phases (8-10 jours)

### `/seo/` - Référencement & Performance

Stratégies SEO et optimisations pour le site public :

- **SEO_STRATEGY.md** - Stratégie SEO complète du site
  - Audit SEO complet (forces/faiblesses)
  - Opportunités mots-clés locaux ("coworking strasbourg")
  - Templates metadata pour chaque type de page
  - Schema.org (LocalBusiness, Article, FAQ, Event)
  - Performance & Core Web Vitals
  - Checklist d'implémentation prioritaire
  - Objectif : +30% trafic organique à 3 mois

### `/refactoring/` - Refactoring & Qualité Code

Documentation des refactorings effectués :

- **HOME_REFACTO_PLAN.md** - Plan de refacto de la home page
- **REFACTO_TEMPLATE.md** - Template pour futurs refactorings
- **REFACTORING_REPORT.md** - Rapport de refactoring complet
- **REFACTORING_SNIPPETS.md** - Snippets de code réutilisables
- **REFACTORING_TREE.md** - Arbre de structure après refacto

### Autres Documents (Racine)

- **CONVENTIONS.md** - Conventions de code du monorepo
- **DEPLOYMENT.md** - Guide de déploiement Northflank (WebSocket support)
- **BADGE_IOS_GUIDE.md** - Guide badge iOS PWA
- **MENU_MODELS_MIGRATION.md** - Migration des models menu
- **NOTIFICATIONS_TROUBLESHOOTING.md** - Debug notifications push

---

## 🗂️ Structure Projet

```
/coworking-cafe/
├── apps/
│   ├── admin/          # Dashboard admin (HR, Comptabilité, Planning)
│   │   └── CLAUDE.md   # Guide développement admin
│   └── site/           # Site public + Dashboard client
│       └── CLAUDE.md   # Guide développement site
├── packages/
│   ├── database/       # Models Mongoose partagés
│   ├── email/          # Templates emails
│   └── shared/         # Utilitaires communs
├── docs/               # Cette documentation
│   ├── architecture/   # Architecture technique
│   ├── seo/            # Stratégie SEO
│   └── refactoring/    # Refactorings
└── CLAUDE.md           # Conventions globales monorepo
```

---

## 📖 Guides par App

### Pour travailler sur **Site Public / Dashboard Client**
→ Lire `/apps/site/CLAUDE.md`
- Stack : Bootstrap + SCSS, NextAuth, Stripe
- Site public + Dashboard client
- Conventions BEM modifiées
- Workflow de réécriture en 7 phases

### Pour travailler sur **Dashboard Admin**
→ Lire `/apps/admin/CLAUDE.md`
- Stack : Tailwind + shadcn/ui
- HR, Pointage, Comptabilité, Planning
- Patterns de sécurité
- Qualité de code (score 98/100)

---

## 🎯 Quick Links

**Architecture** :
- [Packages Database](/docs/architecture/PACKAGES_ARCHITECTURE.md) - 33 models, schemas complets
- [Admin Architecture](/docs/architecture/ADMIN_ARCHITECTURE.md) - Structure app admin

**SEO** :
- [SEO Strategy](/docs/seo/SEO_STRATEGY.md) - Stratégie complète, templates, checklist

**Refactoring** :
- [Refacto Report](/docs/refactoring/REFACTORING_REPORT.md) - Historique refactoring
- [Refacto Template](/docs/refactoring/REFACTO_TEMPLATE.md) - Template pour nouveaux refactorings

**Guides App** :
- [Site CLAUDE.md](/apps/site/CLAUDE.md) - Guide développement site
- [Admin CLAUDE.md](/apps/admin/CLAUDE.md) - Guide développement admin

---

**Dernière mise à jour** : 21 janvier 2026
**Mainteneur** : Thierry + Claude Sonnet 4.5
