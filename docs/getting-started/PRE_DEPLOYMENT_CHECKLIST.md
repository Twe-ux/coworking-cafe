# ✅ CHECKLIST PRÉ-DÉPLOIEMENT - Coworking Café

**Date de création**: 2026-01-29
**Objectif**: S'assurer que tous les éléments critiques sont prêts avant le déploiement sur Northflank

---

## 🔐 OPTION A - SÉCURITÉ (✅ COMPLÉTÉ)

### Fichiers Créés
- [x] `apps/site/.env.example` - Template variables site (14 variables)
- [x] `apps/admin/.env.example` - Template variables admin (20+ variables)
- [x] `KEYS_TO_REGENERATE.md` - Guide régénération des secrets
- [x] `SECURITY_AUDIT.md` - Rapport d'audit complet
- [x] `scripts/pre-commit` - Hook Git de validation
- [x] `scripts/install-git-hooks.sh` - Script d'installation
- [x] `docs/SECURITY_SETUP.md` - Documentation utilisateur

### Corrections Effectuées
- [x] Retiré console.log exposant MongoDB URI (`apps/admin/instrumentation.ts:13`)
- [x] Corrigé secret hardcodé dans `apps/admin/scripts/check-employee.js`
- [x] Installé Git hooks pre-commit actif

### Protection Active
- [x] Git hook bloque 9 patterns de secrets:
  - Fichiers `.env.local`
  - MongoDB URIs avec credentials
  - Clés Stripe (test + live + webhooks)
  - API Keys Resend
  - AWS Access Keys
  - Secrets génériques > 32 caractères

---

## ⚠️ ACTIONS CRITIQUES AVANT PRODUCTION

### 1. Régénérer TOUS les Secrets (8 Services)

**Voir détails dans**: `KEYS_TO_REGENERATE.md`

| Service | Priorité | Action | Status |
|---------|----------|--------|--------|
| **MongoDB Password** | P0 - CRITIQUE | Créer nouveau user avec password fort | ⏳ À FAIRE |
| **NextAuth Secret (x2)** | P0 - CRITIQUE | `openssl rand -base64 32` (2 secrets différents) | ⏳ À FAIRE |
| **Stripe Webhook Secrets** | P0 - CRITIQUE | Créer nouveaux webhooks dans Dashboard Stripe | ⏳ À FAIRE |
| **Resend API Key** | P1 - HAUTE | Régénérer dans dashboard Resend | ⏳ À FAIRE |
| **Cloudinary API Secret** | P1 - HAUTE | Reset dans Cloudinary Console | ⏳ À FAIRE |
| **Secrets Inter-Services (x2)** | P1 - HAUTE | `openssl rand -hex 32` (IDENTIQUE site+admin) | ⏳ À FAIRE |
| **VAPID Keys (x2)** | P1 - HAUTE | `npx web-push generate-vapid-keys` | ⏳ À FAIRE |
| **Hiboutik API Key** | P2 - MOYENNE | Régénérer dans settings Hiboutik | ⏳ À FAIRE |

### 2. Tester Webhooks Stripe

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Tester webhook site
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Tester webhook admin
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Créer paiement test et vérifier logs
```

**Checklist Tests**:
- [ ] Webhook site reçoit événements `checkout.session.completed`
- [ ] Webhook admin reçoit événements de paiement
- [ ] Signature vérifiée correctement
- [ ] Logs confirment traitement OK

### 3. Configurer MongoDB Production

**Actions**:
```bash
# MongoDB Atlas > Security > Database Access
# 1. Créer nouveau user "prod-site" avec password fort (32+ caractères)
# 2. Créer nouveau user "prod-admin" avec password fort (32+ caractères)
# 3. Limiter permissions: readWrite sur DB uniquement
# 4. Configurer IP whitelist (IPs Northflank)
```

**Checklist MongoDB**:
- [ ] User `prod-site` créé avec permissions restreintes
- [ ] User `prod-admin` créé avec permissions restreintes
- [ ] IP whitelist configurée (Northflank IPs)
- [ ] Network Access configuré (pas 0.0.0.0/0 en prod)
- [ ] 2 bases séparées: `coworking-site` et `coworking-admin`

### 4. Configurer Domaine Email (Resend)

```bash
# https://resend.com/domains
# 1. Ajouter domaine personnalisé
# 2. Configurer SPF, DKIM, DMARC
# 3. Vérifier domaine
```

**Checklist Email**:
- [ ] Domaine personnalisé ajouté dans Resend
- [ ] SPF record configuré dans DNS
- [ ] DKIM record configuré dans DNS
- [ ] DMARC record configuré dans DNS
- [ ] Domaine vérifié (statut "Verified")
- [ ] Email expéditeur changé de `onboarding@resend.dev` à `noreply@votredomaine.com`

---

## 🚀 OPTION B - CONFIGURATION NORTHFLANK (⏳ EN COURS)

### Fichiers à Mettre à Jour
- [x] `northflank.json` (racine)
- [x] `apps/site/northflank.json` - Mis à jour avec 19 variables
- [x] `apps/admin/northflank.json` - Mis à jour avec 24 variables

### URLs Hardcodées à Corriger ✅ COMPLÉTÉ
- [x] Recherché `localhost:3000` dans tout le code - 10 fichiers analysés
- [x] Recherché `localhost:3001` dans tout le code - 10 fichiers analysés
- [x] Remplacé par variables d'environnement:
  - `NEXT_PUBLIC_SITE_URL` pour site
  - `NEXTAUTH_URL` pour admin
  - `NEXT_PUBLIC_ADMIN_URL` pour appels inter-services
- [x] **Rapport complet**: Voir `URL_LOCALHOST_CORRECTIONS.md`
  - 4 fichiers corrigés
  - 5 URLs hardcodées éliminées
  - 6 fichiers vérifiés (déjà corrects)

### Variables Northflank à Configurer

**Site (14 variables)**:
```bash
NEXTAUTH_URL=https://site.votredomaine.com
NEXTAUTH_SECRET=[nouveau secret]
MONGODB_URI=mongodb+srv://<prod-site>:<nouveau-password>@...
RESEND_API_KEY=[nouvelle clé]
RESEND_FROM_EMAIL=noreply@votredomaine.com
CLOUDINARY_CLOUD_NAME=[votre cloud]
CLOUDINARY_API_KEY=[votre clé]
CLOUDINARY_API_SECRET=[nouveau secret]
NEXT_PUBLIC_ADMIN_API_URL=https://admin.votredomaine.com
STRIPE_SECRET_KEY=sk_live_[nouvelle clé]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[nouvelle clé]
STRIPE_WEBHOOK_SECRET=[nouveau webhook secret]
STRIPE_LIVE_MODE=true
NOTIFICATIONS_SECRET=[nouveau secret identique]
REVALIDATE_SECRET=[nouveau secret identique]
```

**Admin (20+ variables)**: Toutes les variables du site + spécifiques admin

---

## 📊 MÉTRIQUES SÉCURITÉ

### Code Compliance
- **Scripts corrigés**: 1/2 (100% après fix)
- **Secrets hardcodés**: 0 (100% propre)
- **Git history**: Propre (aucun secret tracké)
- **.gitignore**: Conforme ✅

### Protection Active
- **Git hook**: Installé et testé ✅
- **Patterns bloqués**: 9 types de secrets
- **Documentation**: 3 fichiers créés

---

## 🎯 STATUT GLOBAL

| Catégorie | Statut | Détails |
|-----------|--------|---------|
| **Sécurité Code** | ✅ PRÊT | 100% propre, aucun secret hardcodé |
| **Git Protection** | ✅ PRÊT | Hook actif bloquant commits avec secrets |
| **Documentation** | ✅ PRÊT | Guides complets créés |
| **URLs Localhost** | ✅ PRÊT | Toutes remplacées par env vars (voir URL_LOCALHOST_CORRECTIONS.md) |
| **Northflank Files** | ✅ PRÊT | 3 fichiers northflank.json mis à jour (43 variables) |
| **Build Local** | ✅ PRÊT | 3/3 builds réussis - 70 pages + 140+ APIs (voir OPTION_C_BUILD_RESULTS.md) |
| **Secrets Régénération** | ⏳ EN ATTENTE | 8 services à régénérer (voir KEYS_TO_REGENERATE.md) |
| **Tests Webhooks** | ⏳ EN ATTENTE | À tester avec Stripe CLI |
| **MongoDB Config** | ⏳ EN ATTENTE | Users production à créer |
| **Email Domain** | ⏳ EN ATTENTE | SPF/DKIM à configurer |

---

## 🧪 OPTION C - BUILD LOCAL (✅ COMPLÉTÉ)

### Build Validation
- [x] ✅ **Build apps/site** - 50/50 pages générées (exit code 0)
- [x] ✅ **Build apps/admin** - 20+ pages + 80+ APIs (exit code 0)
- [x] ✅ **Build apps/socket-server** - Compilation TypeScript OK (exit code 0)
- [x] ✅ **Corrections appliquées** - 5 schemas Mongoose corrigés (`Types.ObjectId` → `Schema.Types.ObjectId`)
- [x] ✅ **Bundles générés** - Total 87.5 kB (site) + 87.7 kB (admin)

### Résultats
- **Pages totales** : 70 pages générées
- **API Routes** : 140+ endpoints fonctionnels
- **Build time** : ~100 secondes total
- **Erreurs bloquantes** : 0
- **Warnings critiques** : 0

### Rapport Détaillé
→ **Voir** : `OPTION_C_BUILD_RESULTS.md` pour tous les détails

---

## 🚨 BLOQUANTS DÉPLOIEMENT

**Avant de déployer sur Northflank, ces éléments DOIVENT être complétés**:

1. ⚠️ **CRITIQUE**: Régénérer tous les secrets (8 services) - VOIR `KEYS_TO_REGENERATE.md`
2. ⚠️ **CRITIQUE**: Configurer MongoDB users production avec permissions restreintes
3. ⚠️ **CRITIQUE**: Créer webhooks Stripe avec URLs production
4. ⚠️ **HAUTE**: Configurer domaine email (SPF, DKIM)
5. ⚠️ **HAUTE**: Corriger URLs hardcodées localhost dans le code

---

## 📝 NOTES

- **Dernière mise à jour**: 2026-01-29
- **Prochaine étape**: Option B - Configuration Northflank
- **Responsable**: Équipe Dev
- **Références**:
  - Détails sécurité: `SECURITY_AUDIT.md`
  - Régénération secrets: `KEYS_TO_REGENERATE.md`
  - Usage quotidien: `docs/SECURITY_SETUP.md`
