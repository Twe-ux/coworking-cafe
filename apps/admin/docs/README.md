# 📚 Documentation Admin App

Index complet de la documentation du dashboard admin.

---

## 🗂️ Structure du Dossier `/docs/`

```
/docs/
├── README.md                    # Ce fichier - Index de la documentation
│
├── guides/                      # 📖 Guides de développement (LIRE EN PREMIER)
│   ├── ARCHITECTURE.md          # Structure, models, organisation
│   ├── CONVENTIONS.md           # Règles de code strictes
│   ├── SECURITY.md              # Auth, permissions, secrets
│   ├── API_GUIDE.md             # Patterns API Routes
│   ├── COMPONENTS_GUIDE.md      # Composants React, hooks
│   ├── MIGRATION_GUIDE.md       # Migration depuis /apps/site
│   ├── TYPES_GUIDE.md           # Types partagés TypeScript
│   ├── TESTING.md               # Tests manuels, debugging
│   └── FAQ.md                   # Questions fréquentes
│
├── refactoring/                 # 🔄 Historique du refactoring (Janvier 2026)
│   ├── REFACTORING_SUMMARY.txt  # Résumé complet
│   ├── REFACTORING_FINAL_SUMMARY.md
│   ├── REFACTORING_ReservationDialog.md
│   ├── REFACTORING_SIDEBAR.md
│   └── REFACTORING_STEP3_AVAILABILITY.md
│
├── features/                    # ⚙️ Documentation features spécifiques
│   ├── ONBOARDING.md            # Système onboarding employés
│   ├── SYSTEM_PINS.md           # Gestion des PINs employés
│   ├── POINTAGE_OPTIMIZATION.md # Optimisation module pointage
│   ├── MONGODB_INDEXES.md       # Indexes MongoDB
│   └── VALIDATION_ZOD.md        # Validation avec Zod
│
├── operations/                  # 🚀 Déploiement & Maintenance
│   ├── DEPLOYMENT.md            # Guide de déploiement
│   ├── MONITORING.md            # Monitoring production
│   └── TROUBLESHOOTING.md       # Résolution de problèmes
│
├── improvements/                # 💡 Améliorations futures
│   ├── AMELIORATIONS_PDF.md     # Améliorations génération PDF
│   └── REFONTE_PDF_MODERNE.md   # Refonte design PDF
│
└── [anciens dossiers]/          # 📦 Dossiers historiques (à conserver)
    ├── api/
    ├── architecture/
    ├── components/
    ├── configuration/
    ├── guides/
    ├── maintenance/
    ├── migration/
    ├── security/
    └── testing/
```

---

## 🎯 Par Où Commencer ?

### Pour Nouveau Développeur

1. **CLAUDE.md** (à la racine) - Vue d'ensemble + règles critiques
2. **[guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md)** - Comprendre la structure
3. **[guides/CONVENTIONS.md](./guides/CONVENTIONS.md)** - Règles de code strictes
4. **[guides/FAQ.md](./guides/FAQ.md)** - Questions fréquentes

### Pour Coder une Feature

1. **[guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md)** - Où placer les fichiers ?
2. **[guides/TYPES_GUIDE.md](./guides/TYPES_GUIDE.md)** - Quels types utiliser ?
3. **[guides/API_GUIDE.md](./guides/API_GUIDE.md)** - Comment créer une API ?
4. **[guides/COMPONENTS_GUIDE.md](./guides/COMPONENTS_GUIDE.md)** - Patterns composants
5. **[guides/TESTING.md](./guides/TESTING.md)** - Tests avant commit

### Pour Migrer un Module

1. **[guides/MIGRATION_GUIDE.md](./guides/MIGRATION_GUIDE.md)** - Workflow complet
2. **[guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md)** - Structure cible
3. **[guides/CONVENTIONS.md](./guides/CONVENTIONS.md)** - Respecter les règles
4. **[guides/TESTING.md](./guides/TESTING.md)** - Tester la migration

### Pour Déboguer un Problème

1. **[guides/FAQ.md](./guides/FAQ.md)** - Solutions rapides
2. **[guides/TESTING.md](./guides/TESTING.md)** - Outils de debugging
3. **[operations/TROUBLESHOOTING.md](./operations/TROUBLESHOOTING.md)** - Problèmes courants

### Pour Déployer en Production

1. **[operations/DEPLOYMENT.md](./operations/DEPLOYMENT.md)** - Guide de déploiement
2. **[operations/MONITORING.md](./operations/MONITORING.md)** - Setup monitoring
3. **[guides/SECURITY.md](./guides/SECURITY.md)** - Checklist sécurité

---

## 📋 Règles d'Organisation des .md

### ✅ Où Mettre Quels Fichiers ?

| Type de fichier | Dossier | Exemples |
|-----------------|---------|----------|
| **Guides de dev** | `/docs/guides/` | ARCHITECTURE.md, CONVENTIONS.md, API_GUIDE.md |
| **Historique refactoring** | `/docs/refactoring/` | REFACTORING_*.md |
| **Features spécifiques** | `/docs/features/` | ONBOARDING.md, SYSTEM_PINS.md |
| **Ops & maintenance** | `/docs/operations/` | DEPLOYMENT.md, MONITORING.md |
| **Améliorations futures** | `/docs/improvements/` | AMELIORATIONS_*.md, REFONTE_*.md |
| **README projet** | `/` (racine projet) | README.md |
| **CLAUDE instructions** | `/` (racine projet) | CLAUDE.md |

### ⚠️ Fichiers à NE JAMAIS Mettre dans `/docs/`

- ❌ **README.md du projet** → Racine du projet (`/README.md`)
- ❌ **CLAUDE.md** → Racine du projet (`/CLAUDE.md`)
- ❌ **CHANGELOG.md** → Racine du projet (`/CHANGELOG.md`)
- ❌ **LICENSE** → Racine du projet (`/LICENSE`)

**Pourquoi ?** Ces fichiers sont affichés automatiquement sur GitHub/GitLab à la racine.

### 📝 Nommage des Fichiers .md

```
✅ BON
- ARCHITECTURE.md          (majuscules, descriptif)
- API_GUIDE.md             (underscores pour espaces)
- MIGRATION_GUIDE.md       (clair et concis)

❌ MAUVAIS
- architecture.md          (minuscules - moins visible)
- api guide.md             (espaces - problèmes Git)
- guide-api-routes.md      (trop long)
```

---

## 🔍 Index par Thème

### 🏗️ Architecture & Code

- [ARCHITECTURE.md](./guides/ARCHITECTURE.md) - Structure complète
- [CONVENTIONS.md](./guides/CONVENTIONS.md) - Règles strictes
- [TYPES_GUIDE.md](./guides/TYPES_GUIDE.md) - Types partagés

### 🔒 Sécurité

- [SECURITY.md](./guides/SECURITY.md) - Auth, permissions, secrets
- [SYSTEM_PINS.md](./features/SYSTEM_PINS.md) - Gestion des PINs

### 🌐 APIs & Backend

- [API_GUIDE.md](./guides/API_GUIDE.md) - Patterns API Routes
- [MONGODB_INDEXES.md](./features/MONGODB_INDEXES.md) - Optimisation DB
- [VALIDATION_ZOD.md](./features/VALIDATION_ZOD.md) - Validation inputs

### 🎨 Frontend & UI

- [COMPONENTS_GUIDE.md](./guides/COMPONENTS_GUIDE.md) - Composants React
- [AMELIORATIONS_PDF.md](./improvements/AMELIORATIONS_PDF.md) - PDF design
- [REFONTE_PDF_MODERNE.md](./improvements/REFONTE_PDF_MODERNE.md) - Refonte PDF

### 🔄 Migration & Refactoring

- [MIGRATION_GUIDE.md](./guides/MIGRATION_GUIDE.md) - Migration modules
- [REFACTORING_SUMMARY.txt](./refactoring/REFACTORING_SUMMARY.txt) - Historique
- [REFACTORING_FINAL_SUMMARY.md](./refactoring/REFACTORING_FINAL_SUMMARY.md)

### ⚙️ Features Spécifiques

- [ONBOARDING.md](./features/ONBOARDING.md) - Onboarding employés
- [POINTAGE_OPTIMIZATION.md](./features/POINTAGE_OPTIMIZATION.md) - Pointage

### 🧪 Tests & Debugging

- [TESTING.md](./guides/TESTING.md) - Tests manuels
- [TROUBLESHOOTING.md](./operations/TROUBLESHOOTING.md) - Résolution problèmes

### 🚀 Déploiement & Ops

- [DEPLOYMENT.md](./operations/DEPLOYMENT.md) - Guide déploiement
- [MONITORING.md](./operations/MONITORING.md) - Monitoring production

### 💡 Questions Fréquentes

- [FAQ.md](./guides/FAQ.md) - Réponses rapides

---

## ✅ Checklist Ajout Documentation

Quand tu ajoutes un nouveau fichier `.md` :

- [ ] Nom en MAJUSCULES (MONNOM.md)
- [ ] Underscores pour espaces (MON_GUIDE.md)
- [ ] Placé dans le bon dossier (voir tableau ci-dessus)
- [ ] Ajouté dans cet index (section pertinente)
- [ ] Liens relatifs vers autres docs (./guides/...)
- [ ] Titre H1 en haut du fichier
- [ ] Table des matières si > 200 lignes

---

## 🔗 Liens Externes

### Documentation Technique
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Outils
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/) - Tests API

---

## 📞 Support

**Besoin d'aide ?**
1. Consulter [FAQ.md](./guides/FAQ.md)
2. Chercher dans la doc pertinente
3. Vérifier les exemples de code existants
4. Demander à l'équipe

---

**Dernière mise à jour** : 2026-02-08
**Mainteneur** : Thierry + Claude
