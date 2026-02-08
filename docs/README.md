# 📚 Documentation CoworKing Café - Monorepo

Documentation technique complète du projet CoworKing Café.

---

## 🗂️ Structure du Dossier `/docs/`

```
/docs/
├── README.md                    # Ce fichier - Index de la documentation
│
├── monorepo/                    # 📦 Documentation Monorepo
│   ├── CONVENTIONS.md           # Conventions code globales
│   ├── DEPLOYMENT.md            # Déploiement Northflank
│   ├── DEV_VS_PROD.md           # Différences dev/prod
│   └── INDEX.md                 # Index général
│
├── guides/                      # 📖 Guides Généraux
│   ├── BADGE_IOS_GUIDE.md       # Badge PWA iOS
│   ├── CHECKLIST_DEPLOIEMENT.md # Checklist déploiement
│   ├── PRINT_SYSTEM_GUIDE.md    # Système d'impression
│   └── SECURITY_SETUP.md        # Configuration sécurité
│
├── infrastructure/              # 🏗️ Infrastructure & Ops
│   ├── MONGODB_ATLAS_SETUP.md   # Setup MongoDB Atlas
│   ├── NORTHFLANK_SECRETS_GUIDE.md # Secrets Northflank
│   ├── CRON_JOBS.md             # Tâches planifiées
│   └── RENAME_DATABASE.md       # Renommer base de données
│
├── features/                    # ⚙️ Features Transversales
│   ├── EMAILS_RECAPITULATIF.md  # Système emails
│   ├── MIGRATION_RESEND_TO_SMTP.md # Migration Resend → SMTP
│   ├── NOTIFICATIONS_TROUBLESHOOTING.md # Debug notifications
│   └── MENU_MODELS_MIGRATION.md # Migration models menu
│
├── refactoring/                 # 🔄 Historique Refactoring
│   ├── REFACTO_PHASE3_PLAN.md   # Plan Phase 3
│   ├── REFACTO_PHASE4_PLAN.md   # Plan Phase 4
│   ├── PLAN_COMPOSANTS_REUTILISABLES.md # Composants réutilisables
│   ├── POINT_REFACTO_29_JAN_2026.md # Point refacto
│   ├── REFACTORISATION_FINALE_29_JAN_2026.md # Refacto finale
│   ├── HOME_REFACTO_PLAN.md     # Refacto home
│   ├── REFACTO_TEMPLATE.md      # Template refacto
│   ├── REFACTORING_REPORT.md    # Rapport complet
│   ├── REFACTORING_SNIPPETS.md  # Snippets réutilisables
│   └── REFACTORING_TREE.md      # Structure après refacto
│
├── reports/                     # 📊 Rapports & Analyses
│   ├── CODE_ANALYSIS_REPORT.md  # Analyse code
│   ├── MODELS_AUDIT_REPORT.md   # Audit models
│   ├── REORGANISATION_SUMMARY.md # Résumé réorganisation
│   └── PROGRESS.md              # Progression générale
│
└── [dossiers existants]/        # 📦 Dossiers historiques
    ├── apps/                    # Docs apps spécifiques
    ├── architecture/            # Architecture technique
    ├── archive/                 # Archives
    ├── development/             # Dev guides
    ├── getting-started/         # Démarrage rapide
    ├── operations/              # Opérations
    ├── seo/                     # Stratégie SEO
    └── testing/                 # Tests
```

---

## 🎯 Par Où Commencer ?

### Pour Nouveau Développeur

1. **[CLAUDE.md](../CLAUDE.md)** (racine) - Vue d'ensemble du monorepo
2. **Apps spécifiques** :
   - Site : [apps/site/CLAUDE.md](../apps/site/CLAUDE.md)
   - Admin : [apps/admin/CLAUDE.md](../apps/admin/CLAUDE.md)
3. **[monorepo/CONVENTIONS.md](./monorepo/CONVENTIONS.md)** - Conventions globales
4. **[guides/CHECKLIST_DEPLOIEMENT.md](./guides/CHECKLIST_DEPLOIEMENT.md)** - Déploiement

### Pour Configuration Infrastructure

1. **[infrastructure/MONGODB_ATLAS_SETUP.md](./infrastructure/MONGODB_ATLAS_SETUP.md)** - Setup BD
2. **[infrastructure/NORTHFLANK_SECRETS_GUIDE.md](./infrastructure/NORTHFLANK_SECRETS_GUIDE.md)** - Secrets
3. **[infrastructure/CRON_JOBS.md](./infrastructure/CRON_JOBS.md)** - Tâches planifiées

### Pour Features Transversales

1. **[features/EMAILS_RECAPITULATIF.md](./features/EMAILS_RECAPITULATIF.md)** - Système emails
2. **[features/NOTIFICATIONS_TROUBLESHOOTING.md](./features/NOTIFICATIONS_TROUBLESHOOTING.md)** - Notifications
3. **[features/MENU_MODELS_MIGRATION.md](./features/MENU_MODELS_MIGRATION.md)** - Migration models

---

## 📋 Règles d'Organisation des .md

### ✅ Où Mettre Quels Fichiers ?

| Type de fichier | Dossier | Exemples |
|-----------------|---------|----------|
| **Conventions monorepo** | `/docs/monorepo/` | CONVENTIONS.md, DEPLOYMENT.md |
| **Guides généraux** | `/docs/guides/` | SECURITY_SETUP.md, CHECKLIST_*.md |
| **Infrastructure** | `/docs/infrastructure/` | MONGODB_*.md, CRON_JOBS.md |
| **Features** | `/docs/features/` | EMAILS_*.md, NOTIFICATIONS_*.md |
| **Refactoring** | `/docs/refactoring/` | REFACTO_*.md, PLAN_*.md |
| **Rapports** | `/docs/reports/` | *_REPORT.md, *_ANALYSIS.md |
| **README/CLAUDE** | **Racine projet** | README.md, CLAUDE.md |

### ⚠️ À NE JAMAIS FAIRE

- ❌ Mettre README.md dans `/docs/` → Racine uniquement
- ❌ Mettre CLAUDE.md dans `/docs/` → Racine uniquement
- ❌ Fichiers .md avec espaces → Utiliser underscores (MON_GUIDE.md)
- ❌ Fichiers en minuscules → MAJUSCULES (ARCHITECTURE.md)

---

## 🔍 Index par Thème

### 🏗️ Architecture & Structure

- [architecture/PACKAGES_ARCHITECTURE.md](./architecture/PACKAGES_ARCHITECTURE.md) - 33 models Mongoose
- [architecture/ADMIN_ARCHITECTURE.md](./architecture/ADMIN_ARCHITECTURE.md) - Architecture admin
- [monorepo/CONVENTIONS.md](./monorepo/CONVENTIONS.md) - Conventions globales

### 🚀 Déploiement & Infrastructure

- [monorepo/DEPLOYMENT.md](./monorepo/DEPLOYMENT.md) - Déploiement Northflank
- [infrastructure/MONGODB_ATLAS_SETUP.md](./infrastructure/MONGODB_ATLAS_SETUP.md) - Setup MongoDB
- [infrastructure/NORTHFLANK_SECRETS_GUIDE.md](./infrastructure/NORTHFLANK_SECRETS_GUIDE.md) - Secrets
- [infrastructure/CRON_JOBS.md](./infrastructure/CRON_JOBS.md) - Tâches planifiées
- [guides/CHECKLIST_DEPLOIEMENT.md](./guides/CHECKLIST_DEPLOIEMENT.md) - Checklist

### 📧 Emails & Notifications

- [features/EMAILS_RECAPITULATIF.md](./features/EMAILS_RECAPITULATIF.md) - Système emails
- [features/MIGRATION_RESEND_TO_SMTP.md](./features/MIGRATION_RESEND_TO_SMTP.md) - Migration SMTP
- [features/NOTIFICATIONS_TROUBLESHOOTING.md](./features/NOTIFICATIONS_TROUBLESHOOTING.md) - Debug

### 🔄 Refactoring & Qualité

- [refactoring/REFACTO_PHASE3_PLAN.md](./refactoring/REFACTO_PHASE3_PLAN.md) - Phase 3
- [refactoring/REFACTO_PHASE4_PLAN.md](./refactoring/REFACTO_PHASE4_PLAN.md) - Phase 4
- [refactoring/PLAN_COMPOSANTS_REUTILISABLES.md](./refactoring/PLAN_COMPOSANTS_REUTILISABLES.md) - Composants
- [refactoring/REFACTO_TEMPLATE.md](./refactoring/REFACTO_TEMPLATE.md) - Template

### 📊 Rapports & Analyses

- [reports/CODE_ANALYSIS_REPORT.md](./reports/CODE_ANALYSIS_REPORT.md) - Analyse code
- [reports/MODELS_AUDIT_REPORT.md](./reports/MODELS_AUDIT_REPORT.md) - Audit models
- [reports/PROGRESS.md](./reports/PROGRESS.md) - Progression

### 🔒 Sécurité

- [guides/SECURITY_SETUP.md](./guides/SECURITY_SETUP.md) - Configuration sécurité
- [infrastructure/NORTHFLANK_SECRETS_GUIDE.md](./infrastructure/NORTHFLANK_SECRETS_GUIDE.md) - Secrets

### 🎨 SEO & Marketing

- [seo/SEO_STRATEGY.md](./seo/SEO_STRATEGY.md) - Stratégie SEO complète

---

## 📖 Guides par App

### 🌐 Site Public + Dashboard Client
→ **[apps/site/CLAUDE.md](../apps/site/CLAUDE.md)**

**Quand l'utiliser** :
- Travailler sur pages publiques (Home, Blog, Contact)
- Travailler sur Dashboard client (Réservations, Messages, Promo)
- Features site public

**Stack** : Next.js 14, Bootstrap 5, SCSS, BEM modifié

### 🏢 Dashboard Admin
→ **[apps/admin/CLAUDE.md](../apps/admin/CLAUDE.md)**

**Quand l'utiliser** :
- Travailler sur HR (Employés, Planning, Onboarding)
- Travailler sur Pointage (Time tracking, Shifts)
- Travailler sur Comptabilité (Caisse, CA, PDF)

**Stack** : Next.js 14, Tailwind CSS, shadcn/ui, PWA

---

## 🗂️ Structure Projet Complète

```
/coworking-cafe/
├── apps/
│   ├── admin/          # Dashboard admin (HR, Compta, Planning)
│   │   ├── CLAUDE.md   # Guide développement admin
│   │   └── docs/       # Documentation admin détaillée
│   └── site/           # Site public + Dashboard client
│       ├── CLAUDE.md   # Guide développement site
│       └── docs/       # Documentation site détaillée
├── packages/
│   ├── database/       # Models Mongoose partagés (33 models)
│   ├── email/          # Templates emails
│   └── shared/         # Utilitaires communs
├── docs/               # Cette documentation (monorepo)
│   ├── monorepo/       # Conventions globales
│   ├── guides/         # Guides généraux
│   ├── infrastructure/ # Infra & ops
│   ├── features/       # Features transversales
│   ├── refactoring/    # Historique refacto
│   └── reports/        # Rapports & analyses
└── CLAUDE.md           # Conventions globales monorepo
```

---

## ✅ Checklist Ajout Documentation

Quand tu ajoutes un nouveau fichier `.md` :

- [ ] Nom en MAJUSCULES (MONNOM.md)
- [ ] Underscores pour espaces (MON_GUIDE.md)
- [ ] Placé dans le bon dossier (voir tableau ci-dessus)
- [ ] Ajouté dans cet index (section pertinente)
- [ ] Liens relatifs vers autres docs (./guides/...)
- [ ] Titre H1 en haut du fichier
- [ ] Date de dernière mise à jour

---

## 🔗 Liens Externes

### Documentation Apps
- [Site CLAUDE.md](../apps/site/CLAUDE.md) - Guide développement site
- [Admin CLAUDE.md](../apps/admin/CLAUDE.md) - Guide développement admin

### Documentation Technique
- [Next.js 14](https://nextjs.org/docs/app)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Northflank](https://northflank.com/docs/)

---

**Dernière mise à jour** : 2026-02-08
**Mainteneur** : Thierry + Claude
