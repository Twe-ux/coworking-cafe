# 📚 Documentation CoworKing Café - Index Principal

> **Navigation complète** de toute la documentation du monorepo

**Dernière mise à jour** : 2026-01-29

---

## 🚀 Démarrage Rapide

**Première fois sur le projet ?** Commencez ici :

1. **Setup Initial** → [Getting Started - Setup](./getting-started/SETUP.md)
2. **Comprendre l'Architecture** → [Architecture - Vue d'ensemble](./architecture/OVERVIEW.md)
3. **Développer** → Choisir votre app :
   - [Admin Dashboard](./apps/ADMIN.md) (Tailwind + shadcn/ui)
   - [Site Public + Client Dashboard](./apps/SITE.md) (Bootstrap + SCSS)
   - [Socket Server](./apps/SOCKET_SERVER.md) (WebSockets)

---

## 📂 Structure de la Documentation

### 1. [Getting Started](./getting-started/) - Démarrage

| Fichier | Description |
|---------|-------------|
| [SETUP.md](./getting-started/SETUP.md) | Installation et configuration initiale |
| [DEPLOYMENT.md](./getting-started/DEPLOYMENT.md) | Guide de déploiement (Northflank) |
| [PRE_DEPLOYMENT_CHECKLIST.md](./getting-started/PRE_DEPLOYMENT_CHECKLIST.md) | Checklist avant déploiement |

### 2. [Architecture](./architecture/) - Structure du Projet

| Fichier | Description |
|---------|-------------|
| [OVERVIEW.md](./architecture/OVERVIEW.md) | Vue d'ensemble du monorepo |
| [PACKAGES.md](./architecture/PACKAGES.md) | Packages partagés (@coworking-cafe/*) |
| [ADMIN_APP.md](./architecture/ADMIN_APP.md) | Architecture app admin |
| [SITE_APP.md](./architecture/SITE_APP.md) | Architecture app site |

### 3. [Operations](./operations/) - Production & Maintenance

| Fichier | Description |
|---------|-------------|
| [DEPLOYMENT.md](./operations/DEPLOYMENT.md) | Déploiement Northflank |
| [SECURITY.md](./operations/SECURITY.md) | Sécurité & Secrets |
| [MONITORING.md](./operations/MONITORING.md) | Monitoring production |
| [TROUBLESHOOTING.md](./operations/TROUBLESHOOTING.md) | Résolution problèmes |

### 4. [Development](./development/) - Guides de Développement

| Fichier | Description |
|---------|-------------|
| [CONVENTIONS.md](./development/CONVENTIONS.md) | Conventions de code |
| [TESTING.md](./development/TESTING.md) | Tests & QA |
| [REFACTORING.md](./development/REFACTORING.md) | Guides de refactorisation |
| [MIGRATIONS.md](./development/MIGRATIONS.md) | Migrations de données/code |

### 5. [Features](./features/) - Fonctionnalités Spécifiques

| Fichier | Description |
|---------|-------------|
| [SEO_STRATEGY.md](./features/SEO_STRATEGY.md) | Stratégie SEO complète |
| [NOTIFICATIONS.md](./features/NOTIFICATIONS.md) | Système de notifications push |
| [PWA_SETUP.md](./features/PWA_SETUP.md) | Progressive Web App |
| [N8N_WORKFLOWS.md](./features/N8N_WORKFLOWS.md) | Workflows N8N (cron jobs) |

### 6. [Apps](./apps/) - Documentation par Application

| Fichier | Description |
|---------|-------------|
| [ADMIN.md](./apps/ADMIN.md) | Dashboard Admin (résumé) |
| [SITE.md](./apps/SITE.md) | Site Public + Dashboard Client (résumé) |
| [SOCKET_SERVER.md](./apps/SOCKET_SERVER.md) | Serveur WebSocket |

### 7. [Reports](./reports/) - Audits & Rapports

| Fichier | Description |
|---------|-------------|
| [SECURITY_AUDIT.md](./reports/SECURITY_AUDIT.md) | Audit de sécurité |
| [MODELS_AUDIT.md](./reports/MODELS_AUDIT.md) | Audit des models MongoDB |
| [BUILD_RESULTS.md](./reports/BUILD_RESULTS.md) | Résultats de build |

### 8. [Archive](./archive/) - Documentation Historique

Documents obsolètes ou alternatives non retenues.

---

## 🎯 Par Cas d'Usage

### Je veux déployer en production
1. [Pre-Deployment Checklist](./getting-started/PRE_DEPLOYMENT_CHECKLIST.md)
2. [Security - Régénérer les secrets](./operations/SECURITY.md)
3. [Deployment Guide](./operations/DEPLOYMENT.md)

### Je veux développer une nouvelle feature
1. [Conventions de code](./development/CONVENTIONS.md)
2. Choisir l'app : [Admin](./apps/ADMIN.md) ou [Site](./apps/SITE.md)
3. [Architecture Packages](./architecture/PACKAGES.md) (models partagés)

### Je veux corriger un bug
1. [Troubleshooting](./operations/TROUBLESHOOTING.md)
2. [Known Issues - Admin](/apps/admin/docs/maintenance/KNOWN_ISSUES.md)
3. [Testing Checklist](./development/TESTING.md)

### Je veux comprendre l'architecture
1. [Architecture Overview](./architecture/OVERVIEW.md)
2. [Packages Architecture](./architecture/PACKAGES.md)
3. Docs spécifiques : [Admin](./architecture/ADMIN_APP.md) | [Site](./architecture/SITE_APP.md)

---

## 📱 Documentation par Application

### Apps/Admin - Dashboard Admin
- **CLAUDE.md complet** → `/apps/admin/CLAUDE.md` (2,105 lignes)
- **Docs détaillées** → `/apps/admin/docs/` (37 fichiers)
- **Résumé** → [docs/apps/ADMIN.md](./apps/ADMIN.md)

### Apps/Site - Site Public + Dashboard Client
- **CLAUDE.md complet** → `/apps/site/CLAUDE.md` (4,232 lignes)
- **Docs détaillées** → `/apps/site/docs/` (11 fichiers)
- **Résumé** → [docs/apps/SITE.md](./apps/SITE.md)

### Apps/Socket-Server - WebSockets
- **README.md** → `/apps/socket-server/README.md`
- **Résumé** → [docs/apps/SOCKET_SERVER.md](./apps/SOCKET_SERVER.md)

---

## 🔗 Liens Rapides

### Configuration
- [Variables d'environnement](./getting-started/SETUP.md#variables-denvironnement)
- [Northflank Config](./operations/DEPLOYMENT.md#configuration-northflank)
- [Git Hooks](./operations/SECURITY.md#git-hooks)

### Développement
- [Code Conventions](./development/CONVENTIONS.md)
- [TypeScript Rules](./development/CONVENTIONS.md#typescript)
- [Testing Guide](./development/TESTING.md)

### Production
- [Deployment](./operations/DEPLOYMENT.md)
- [Monitoring](./operations/MONITORING.md)
- [Security](./operations/SECURITY.md)

---

## 📊 Statistiques

- **Total documentation** : ~40,000 lignes
- **Fichiers .md** : 103 fichiers
- **Apps** : 3 (admin, site, socket-server)
- **Packages partagés** : 4 (database, email, shared, admin-shared)

---

## 🛠️ Maintenance de la Documentation

### Ajouter un nouveau document

1. Créer le fichier dans le bon dossier (`docs/development/`, etc.)
2. Ajouter l'entrée dans cet INDEX.md
3. Commit avec message descriptif

### Mettre à jour la documentation

- **Toujours** mettre à jour la date "Dernière mise à jour" en haut du fichier
- Respecter le format Markdown existant
- Ajouter des liens vers d'autres docs pertinentes

---

**Besoin d'aide ?** Consultez le [Troubleshooting](./operations/TROUBLESHOOTING.md) ou demandez à l'équipe.
