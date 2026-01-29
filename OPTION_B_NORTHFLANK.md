# ⚙️ OPTION B - CONFIGURATION NORTHFLANK

**Date**: 2026-01-29
**Objectif**: Préparer la configuration Northflank pour le déploiement

---

## ✅ COMPLÉTÉ

### 1. Mise à Jour Fichiers northflank.json

**Fichiers mis à jour** :
- ✅ `apps/site/northflank.json` - **Passé de 7 à 19 variables**
- ✅ `apps/admin/northflank.json` - **Passé de 8 à 24 variables**
- ✅ `apps/socket-server/northflank.json` - Déjà complet (5 variables)

---

## 📋 VARIABLES AJOUTÉES

### apps/site (19 variables totales)

**Nouvelles variables ajoutées** :
```bash
# Resend (Email)
RESEND_API_KEY
RESEND_FROM_EMAIL

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Stripe (complet)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY     # ← NOUVEAU
STRIPE_WEBHOOK_SECRET_SITE             # ← RENOMMÉ (séparé site/admin)
STRIPE_LIVE_MODE                       # ← NOUVEAU

# Secrets Inter-Services
NOTIFICATIONS_SECRET
REVALIDATE_SECRET

# Hiboutik (optionnel)
HIBOUTIK_API_URL
HIBOUTIK_API_KEY
```

### apps/admin (24 variables totales)

**Nouvelles variables ajoutées** :
```bash
# MongoDB
MONGODB_DB=coworking-admin             # ← NOUVEAU

# Resend (Email)
RESEND_API_KEY
RESEND_FROM_EMAIL

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Sécurité Interface Staff
STAFF_ALLOWED_IPS                      # ← NOUVEAU
ALLOWED_STAFF_IPS                      # ← NOUVEAU
MAX_PIN_ATTEMPTS_PER_MINUTE=5          # ← NOUVEAU
PIN_LOCKOUT_DURATION_MINUTES=15        # ← NOUVEAU

# VAPID (Push Notifications)
VAPID_SUBJECT                          # ← NOUVEAU

# Stripe (complet)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY     # ← NOUVEAU
STRIPE_WEBHOOK_SECRET_ADMIN            # ← RENOMMÉ (séparé site/admin)
STRIPE_LIVE_MODE                       # ← NOUVEAU

# Secrets Inter-Services
NOTIFICATIONS_SECRET
REVALIDATE_SECRET

# NextAuth
NEXTAUTH_SECRET_ADMIN                  # ← RENOMMÉ (séparé site/admin)
```

---

## 🎯 PROCHAINES ÉTAPES

### Étape 1: Configurer les Variables dans Northflank Dashboard

**⚠️ IMPORTANT** : Avant de déployer, vous devez configurer TOUTES ces variables dans Northflank avec les **VRAIES valeurs** (voir `KEYS_TO_REGENERATE.md`).

**Instructions** :

#### A. Variables Globales (Partagées entre Site et Admin)

Dans **Northflank Dashboard > Project Settings > Environment Variables**, créer :

```bash
# URLs de Production (À CONFIGURER)
SITE_URL=https://site.votredomaine.com
ADMIN_URL=https://admin.votredomaine.com
SOCKET_URL=https://socket.votredomaine.com

# MongoDB (À RÉGÉNÉRER)
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/

# Resend (À RÉGÉNÉRER)
RESEND_API_KEY=re_[NOUVELLE_CLÉ]
RESEND_FROM_EMAIL=noreply@votredomaine.com

# Cloudinary (À RÉGÉNÉRER)
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-clé
CLOUDINARY_API_SECRET=[NOUVEAU_SECRET]

# Stripe (À RÉGÉNÉRER)
STRIPE_SECRET_KEY=sk_live_[NOUVELLE_CLÉ]
STRIPE_PUBLISHABLE_KEY=pk_live_[NOUVELLE_CLÉ]
STRIPE_WEBHOOK_SECRET_SITE=whsec_[NOUVEAU_SECRET_SITE]
STRIPE_WEBHOOK_SECRET_ADMIN=whsec_[NOUVEAU_SECRET_ADMIN]
STRIPE_LIVE_MODE=true

# Secrets Inter-Services (À RÉGÉNÉRER - IDENTIQUES)
NOTIFICATIONS_SECRET=[openssl rand -hex 32]
REVALIDATE_SECRET=[openssl rand -hex 32]

# Hiboutik (Optionnel)
HIBOUTIK_API_URL=https://[account].hiboutik.com/api
HIBOUTIK_API_KEY=[CLÉ]
```

#### B. Variables Spécifiques Site

Dans **Northflank > coworking-site > Environment Variables** :

```bash
# NextAuth Site
NEXTAUTH_SECRET=[openssl rand -base64 32]  # ← SECRET DIFFÉRENT DE ADMIN
```

#### C. Variables Spécifiques Admin

Dans **Northflank > coworking-admin > Environment Variables** :

```bash
# NextAuth Admin
NEXTAUTH_SECRET_ADMIN=[openssl rand -base64 32]  # ← SECRET DIFFÉRENT DE SITE

# JWT
JWT_SECRET=[openssl rand -base64 32]

# MongoDB DB Name
MONGODB_DB=coworking-admin

# VAPID (Push Notifications)
VAPID_PUBLIC_KEY=[npx web-push generate-vapid-keys]
VAPID_PRIVATE_KEY=[npx web-push generate-vapid-keys]
VAPID_SUBJECT=mailto:admin@votredomaine.com

# Sécurité Staff (Optionnel)
STAFF_ALLOWED_IPS=  # Laisser vide ou IPs séparées par virgule
ALLOWED_STAFF_IPS=  # Laisser vide ou IPs séparées par virgule
```

---

### Étape 2: Corriger les URLs Localhost Hardcodées ✅ TERMINÉ

**Status** : ✅ **COMPLÉTÉ** - Toutes les URLs hardcodées critiques ont été corrigées

**Voir le rapport détaillé** : `URL_LOCALHOST_CORRECTIONS.md`

#### Résumé des Corrections

| Métrique | Valeur |
|----------|--------|
| **Fichiers analysés** | 10 |
| **Fichiers corrigés** | 4 |
| **Fichiers déjà corrects** | 6 |
| **URLs hardcodées éliminées** | 5 |

#### Fichiers Corrigés

1. **apps/admin/src/lib/revalidate-site-cache.ts:8**
   - Bug corrigé : pointait vers 3001 au lieu de 3000
   - Maintenant utilise `process.env.NEXT_PUBLIC_SITE_URL`

2. **apps/site/src/middleware.ts:123**
   - Redirect admin → variable d'environnement

3. **apps/site/src/components/site/header/header.tsx:24,88**
   - 2 occurrences dans header → variables d'environnement

#### Pattern Appliqué

Toutes les corrections suivent ce pattern standardisé :

```typescript
// ✅ Pattern standard appliqué partout
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Usage
return NextResponse.redirect(new URL(adminUrl, req.url));
```

#### Variables d'Environnement Configurées

```typescript
// Apps/site
NEXT_PUBLIC_ADMIN_URL=https://admin.votredomaine.com  // Pour redirects client
NEXT_PUBLIC_SITE_URL=https://site.votredomaine.com
ADMIN_URL=https://admin.votredomaine.com              // Pour API calls server

// Apps/admin
NEXT_PUBLIC_SITE_URL=https://site.votredomaine.com
NEXTAUTH_URL=https://admin.votredomaine.com
```

#### Validation

```bash
# Type-check réussi
cd apps/site && pnpm type-check    # ✅ 0 errors
cd apps/admin && pnpm type-check   # ✅ 0 errors

# Recherche finale hardcoded URLs (hors commentaires)
grep -r "\"http://localhost" apps/*/src | grep -v "process.env"
# Résultat : 0 URLs hardcodées trouvées ✅
```

---

### Étape 3: Tester le Build Localement

**Avant de déployer sur Northflank**, tester le build complet :

```bash
# 1. Se placer à la racine du monorepo
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe

# 2. Nettoyer les builds précédents
pnpm clean

# 3. Installer les dépendances
pnpm install --frozen-lockfile

# 4. Build packages dans l'ordre
pnpm --filter @coworking-cafe/database build
pnpm --filter @coworking-cafe/email build
pnpm --filter @coworking-cafe/shared build
pnpm --filter @coworking-cafe/admin-shared build

# 5. Build apps
pnpm --filter @coworking-cafe/site build
pnpm --filter @coworking-cafe/admin build
pnpm --filter @coworking-cafe/socket-server build

# 6. Vérifier qu'il n'y a pas d'erreurs
echo "✅ Build réussi si aucune erreur ci-dessus"
```

**En cas d'erreurs** :
- Vérifier les types TypeScript
- Vérifier les imports de packages
- Vérifier les variables d'environnement manquantes

---

## 📊 STATUT GLOBAL

| Tâche | Statut | Détails |
|-------|--------|---------|
| **northflank.json mise à jour** | ✅ COMPLÉTÉ | 3 fichiers configurés |
| **Variables recensées** | ✅ COMPLÉTÉ | 43 variables totales |
| **Variables Northflank** | ⏳ À FAIRE | Configurer dans dashboard |
| **URLs localhost** | ✅ COMPLÉTÉ | 4 fichiers corrigés, 5 URLs éliminées |
| **Build test local** | ⏳ À FAIRE | Tester avant déploiement |
| **Webhooks Stripe** | ⏳ À FAIRE | Créer 2 webhooks production |
| **Domaine email** | ⏳ À FAIRE | SPF/DKIM dans DNS |

---

## ⚠️ WARNINGS IMPORTANTS

### 1. Stripe Webhooks Secrets Séparés

**IMPORTANT** : Site et Admin ont des webhooks Stripe DIFFÉRENTS :

```bash
# Site (checkout public)
STRIPE_WEBHOOK_SECRET_SITE=whsec_[SECRET_SITE]
# Webhook URL: https://site.votredomaine.com/api/stripe/webhook

# Admin (gestion admin)
STRIPE_WEBHOOK_SECRET_ADMIN=whsec_[SECRET_ADMIN]
# Webhook URL: https://admin.votredomaine.com/api/stripe/webhook
```

**Actions** :
1. Créer 2 webhooks dans Stripe Dashboard
2. Copier les 2 secrets différents
3. Configurer dans Northflank

### 2. NextAuth Secrets Différents

**IMPORTANT** : Site et Admin ont des secrets NextAuth DIFFÉRENTS :

```bash
# Site
NEXTAUTH_SECRET=[SECRET_1]

# Admin
NEXTAUTH_SECRET_ADMIN=[SECRET_2]
```

**Pourquoi ?** : Sécurité - sessions séparées entre applications client et admin.

### 3. Secrets Inter-Services IDENTIQUES

**IMPORTANT** : Ces secrets DOIVENT être IDENTIQUES dans site et admin :

```bash
NOTIFICATIONS_SECRET=xxxxxxxxx  # ← MÊME VALEUR site + admin
REVALIDATE_SECRET=xxxxxxxxxxx   # ← MÊME VALEUR site + admin
```

**Pourquoi ?** : Communication entre apps (admin peut notifier site, site peut revalider cache admin).

---

## 🔐 SÉCURITÉ

### Variables Sensibles à RÉGÉNÉRER

**Avant déploiement**, régénérer ces secrets (voir `KEYS_TO_REGENERATE.md`) :

- [ ] NEXTAUTH_SECRET (x2 - site + admin différents)
- [ ] MONGODB_URI (nouveau password)
- [ ] STRIPE_SECRET_KEY (live key)
- [ ] STRIPE_WEBHOOK_SECRET (x2 - site + admin)
- [ ] RESEND_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] NOTIFICATIONS_SECRET (identique site+admin)
- [ ] REVALIDATE_SECRET (identique site+admin)
- [ ] VAPID_PRIVATE_KEY
- [ ] JWT_SECRET

---

## 📝 NOTES

### Socket Server

Le fichier `apps/socket-server/northflank.json` était déjà correct et complet. Aucune modification nécessaire.

**Variables configurées** :
- NODE_ENV=production
- PORT=3002
- ALLOWED_ORIGINS (site + admin URLs)
- MONGODB_URI
- JWT_SECRET

### Ressources Allouées

**apps/site** :
- CPU: 0.5 (plus que admin car plus de trafic)
- Memory: 512 MB
- Replicas: 1

**apps/admin** :
- CPU: 0.25
- Memory: 512 MB
- Replicas: 1

**apps/socket-server** :
- CPU: 0.25
- Memory: 256 MB
- Replicas: 1

**À ajuster** selon le trafic réel après déploiement.

---

## 🎯 CHECKLIST FINALE

Avant de déployer sur Northflank :

- [ ] **KEYS_TO_REGENERATE.md** - Tous les 8 services régénérés
- [ ] **Northflank Variables** - Toutes configurées (43 variables)
- [x] **URLs localhost** - ✅ Toutes remplacées par variables d'environnement (voir `URL_LOCALHOST_CORRECTIONS.md`)
- [ ] **Build local** - Test réussi (pnpm build)
- [ ] **Webhooks Stripe** - 2 webhooks créés (site + admin)
- [ ] **Domaine email** - SPF + DKIM configurés
- [ ] **MongoDB** - Users production créés (permissions restreintes)
- [ ] **Secrets séparés** - NextAuth et Stripe webhooks différents
- [ ] **Secrets identiques** - Notifications et Revalidate identiques

---

**Prochaine étape** : Tester le build local avec les variables d'environnement

**Voir aussi** :
- `PRE_DEPLOYMENT_CHECKLIST.md` - Checklist complète pré-déploiement
- `KEYS_TO_REGENERATE.md` - Guide régénération secrets
- `SECURITY_AUDIT.md` - Rapport d'audit sécurité

---

**Dernière mise à jour** : 2026-01-29
**Responsable** : Équipe Dev
