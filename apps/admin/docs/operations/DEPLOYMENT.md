# DEPLOYMENT.md - Guide de Déploiement

> Documentation pour le déploiement de l'application admin sur Vercel
> **Version** : 1.0
> **Dernière mise à jour** : 2026-01-21

---

## Table des matières

1. [Pre-deployment checklist](#pre-deployment-checklist)
2. [Variables d'environnement](#variables-denvironnement)
3. [Build et déploiement sur Vercel](#build-et-déploiement-sur-vercel)
4. [Tests post-déploiement](#tests-post-déploiement)
5. [Rollback en cas de problème](#rollback-en-cas-de-problème)

---

## Pre-deployment checklist

**À vérifier AVANT chaque déploiement** :

### Code Quality

```bash
# 1. Type check - Aucune erreur TypeScript
cd /apps/admin
pnpm type-check

# 2. Lint - Aucune erreur ESLint
pnpm lint

# 3. Build local - Doit réussir
pnpm build

# 4. Test en local après build
pnpm start
# Tester les pages critiques (login, dashboard, APIs)
```

### Sécurité

- [ ] Toutes les routes API sont protégées avec `requireAuth()` (sauf auth/verify-pin/clock-in/clock-out)
- [ ] Aucun secret/token en dur dans le code
- [ ] `.env.local` n'est PAS commité
- [ ] Les variables sensibles sont dans Vercel Environment Variables

### Base de données

- [ ] La connexion MongoDB fonctionne en production
- [ ] Les indexes MongoDB sont créés si nécessaire
- [ ] Les migrations de données ont été exécutées si besoin

### Features

- [ ] Toutes les nouvelles features ont été testées manuellement (voir [TESTING_CHECKLIST.md](./testing/TESTING_CHECKLIST.md))
- [ ] Les pages d'erreur (404, 403, 401, 500) fonctionnent
- [ ] Le système de notifications push fonctionne (si activé)

### Git

```bash
# Status propre
git status
# → No uncommitted changes (sauf .env.local)

# Branche à jour
git pull origin main

# Commit avec message descriptif
git add .
git commit -m "feat(admin): add booking module"
git push origin main
```

---

## Variables d'environnement

### Variables requises sur Vercel

**Créer un fichier de référence locale** : `/apps/admin/.env.example`

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coworking-cafe?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://admin.coworkingcafe.fr

# Email (Resend)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@coworkingcafe.fr

# Push Notifications (optionnel)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_MAILTO=mailto:support@coworkingcafe.fr

# Stripe (si intégration paiements)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# App Config
NEXT_PUBLIC_APP_URL=https://admin.coworkingcafe.fr
NODE_ENV=production
```

### Générer les secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# VAPID Keys (pour notifications push)
cd /apps/admin
pnpm generate-vapid-keys
```

### Configuration Vercel

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet `coworking-cafe-admin`
3. `Settings` → `Environment Variables`
4. Ajouter **TOUTES** les variables ci-dessus
5. **Production** : Sélectionner "Production" uniquement
6. **Preview** : Optionnel (pour branches de test)

**IMPORTANT** :
- ❌ Ne JAMAIS commiter `.env.local`
- ✅ Toujours utiliser Vercel Environment Variables en prod
- ✅ Dupliquer `.env.example` en local pour dev

---

## Build et déploiement sur Vercel

### Déploiement automatique (recommandé)

**Vercel déploie automatiquement depuis GitHub** :

1. **Push sur `main`** → Déploiement en production
2. **Push sur branche** → Déploiement preview

```bash
# Exemple workflow
git checkout -b feat/booking-module
# ... développement ...
git add .
git commit -m "feat(admin): add booking calendar"
git push origin feat/booking-module

# → Vercel crée un déploiement preview
# → Tester sur l'URL preview
# → Si OK, merger la PR

git checkout main
git merge feat/booking-module
git push origin main

# → Déploiement automatique en production
```

### Déploiement manuel (backup)

```bash
# Installer Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Déployer en production
cd /apps/admin
vercel --prod

# Suivre les instructions
# → Sélectionner le projet existant
# → Confirmer les variables d'environnement
```

### Build optimisé

Vercel exécute automatiquement :

```bash
pnpm install        # Installation des dépendances
pnpm build          # Build Next.js
```

**Next.js config** : `/apps/admin/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Optimisations production
  output: 'standalone',

  // Gestion des images
  images: {
    domains: ['res.cloudinary.com'], // Si images externes
  },

  // Headers sécurité (optionnel)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## Tests post-déploiement

**Checklist à tester IMMÉDIATEMENT après déploiement** :

### 1. Accès et Authentification (5 min)

```bash
# URL de production
https://admin.coworkingcafe.fr
```

- [ ] La page d'accueil charge correctement
- [ ] Le login fonctionne avec un compte admin
- [ ] Le login échoue avec un compte invalide
- [ ] La session persiste après refresh (F5)
- [ ] Le logout fonctionne

### 2. Navigation (3 min)

- [ ] Le menu sidebar s'affiche correctement
- [ ] Tous les liens du menu fonctionnent
- [ ] Les pages d'erreur (404, 403) s'affichent si besoin
- [ ] Les pages protégées redirigent vers login si non authentifié

### 3. APIs critiques (5 min)

**Ouvrir la console (F12) et tester** :

```javascript
// Test API employees (exemple)
fetch('https://admin.coworkingcafe.fr/api/hr/employees', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
// → Doit retourner { success: true, data: [...] }

// Test API sans auth (doit échouer)
fetch('https://admin.coworkingcafe.fr/api/hr/employees')
  .then(r => r.json())
  .then(console.log)
// → Doit retourner { success: false, error: '...' } (401)
```

**Pages à tester** :

- [ ] `/admin/hr/employees` - Liste des employés
- [ ] `/admin/accounting/cash-control` - Caisse
- [ ] `/clocking` - Pointage
- [ ] `/admin/hr/schedule` - Planning

### 4. Base de données (3 min)

- [ ] Les données MongoDB se chargent correctement
- [ ] Les mutations (create/update/delete) fonctionnent
- [ ] Les erreurs DB sont bien gérées (message utilisateur friendly)

### 5. Notifications Push (si activé) (2 min)

- [ ] La demande de permission s'affiche
- [ ] Les notifications de test fonctionnent
- [ ] Le Service Worker est enregistré (voir Application > Service Workers dans DevTools)

### 6. Performance (2 min)

**Ouvrir Lighthouse (F12 > Lighthouse)** :

- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80 (moins important pour app admin)

---

## Rollback en cas de problème

### Rollback automatique (Vercel)

**Si le build échoue** → Vercel garde l'ancienne version active ✅

**Si le build réussit mais l'app crash** :

1. Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet `coworking-cafe-admin`
3. Onglet `Deployments`
4. Trouver le dernier déploiement stable (avec ✅)
5. Cliquer sur `...` → `Promote to Production`

**Temps de rollback** : ~30 secondes

### Rollback Git

```bash
# 1. Identifier le dernier commit stable
git log --oneline
# abc123 feat: stable version
# def456 feat: broken feature

# 2. Revenir au commit stable
git revert def456
# ou
git reset --hard abc123

# 3. Force push (ATTENTION)
git push origin main --force

# → Vercel redéploie automatiquement
```

**⚠️ ATTENTION** : `git push --force` peut causer des problèmes si plusieurs personnes travaillent sur la branche.

**Alternative plus sûre** :

```bash
# Créer un nouveau commit qui annule le précédent
git revert HEAD
git push origin main
```

### Checklist Rollback

- [ ] Identifier la cause du problème (logs Vercel/MongoDB)
- [ ] Documenter le bug dans [BUGS.md](./maintenance/BUGS.md)
- [ ] Rollback vers version stable
- [ ] Vérifier que l'app fonctionne à nouveau
- [ ] Corriger le bug en local
- [ ] Re-tester en local avant re-déploiement
- [ ] Re-déployer la correction

---

## Monitoring post-déploiement

### Logs Vercel

**Accéder aux logs** :

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Projet `coworking-cafe-admin`
3. Onglet `Logs`
4. Filtrer par type :
   - `Edge Functions` → Logs API Routes
   - `Build` → Logs de build
   - `Serverless Functions` → Logs API Routes

**Console Logs** :

```typescript
// Dans le code
console.log('[API] Employees fetched:', count)
console.error('[API] Error fetching employees:', error)

// Visible dans Vercel Logs
```

### MongoDB Logs

**MongoDB Atlas** :

1. Aller sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sélectionner le cluster
3. `Metrics` → Performance
4. Vérifier :
   - Connexions actives
   - Requêtes lentes (> 100ms)
   - Erreurs de connexion

### Alertes recommandées

**Configurer des alertes pour** :

- [ ] Build qui échoue (notification Vercel → Slack/Email)
- [ ] Erreurs 500 fréquentes (Vercel Analytics)
- [ ] Connexions MongoDB qui échouent (MongoDB Atlas Alerts)
- [ ] Trafic inhabituel (pic de requêtes)

---

## Checklist finale déploiement

**Avant de fermer ce document** :

- [ ] Build local réussi
- [ ] Type check passé
- [ ] Git push effectué
- [ ] Déploiement Vercel terminé (✅ sur dashboard)
- [ ] Tests post-déploiement effectués (checklist ci-dessus)
- [ ] Aucune erreur dans Vercel Logs (première heure)
- [ ] Équipe notifiée du déploiement
- [ ] Documentation mise à jour si nécessaire

---

## Ressources

- **Vercel Dashboard** : https://vercel.com/dashboard
- **Vercel Docs** : https://vercel.com/docs
- **Next.js Deployment** : https://nextjs.org/docs/deployment
- **MongoDB Atlas** : https://cloud.mongodb.com/
- **Guide Testing** : [TESTING_CHECKLIST.md](./testing/TESTING_CHECKLIST.md)
- **Guide Troubleshooting** : [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

_Documentation maintenue par l'équipe CoworKing Cafe_
