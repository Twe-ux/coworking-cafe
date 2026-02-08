# ✅ CHECKLIST DÉPLOIEMENT PRODUCTION

**Date** : 2026-01-29
**App** : apps/site (Site public + Dashboard client)
**Environnement** : Northflank Production

---

## 📊 ÉTAT ACTUEL

### Code Quality ✅
- [x] Refactorisation terminée (82+ types `any` éliminés)
- [x] Build réussi (`pnpm build`)
- [x] TypeScript : ~14 erreurs (stables, non bloquantes)
- [x] Documentation complète

### Tests Manuels ⏳
- [ ] **EN COURS** - À effectuer avant déploiement
- [ ] Guide de test : `docs/testing/MANUEL_TEST_REFACTO.md`

---

## 🎯 PRÉREQUIS AVANT DÉPLOIEMENT

### 1. Tests Manuels (CRITIQUE)

**Document** : `docs/testing/MANUEL_TEST_REFACTO.md`

#### Tests Prioritaires (1-2h)

**Booking Flow** :
- [ ] Page booking/details - Formulaire contact
- [ ] Page booking/details - Services additionnels
- [ ] Page booking/summary - Récapitulatif
- [ ] Page booking/summary - Switch TTC/HT
- [ ] Page booking/summary - Formulaire paiement Stripe
- [ ] Console browser : 0 erreurs

**Profile** :
- [ ] Page [id]/profile - Affichage
- [ ] Page [id]/profile - Édition
- [ ] API /api/user/profile - GET et PUT
- [ ] Console browser : 0 erreurs

**Responsive** :
- [ ] Mobile (375px) - Toutes pages
- [ ] Tablet (768px) - Toutes pages
- [ ] Desktop (1200px+) - Toutes pages

**Résultat attendu** :
- ✅ Tous tests passent → Continuer déploiement
- ❌ Tests échouent → Corriger avant déploiement

---

### 2. Variables d'Environnement

#### Variables Actuelles (.env.local)

```bash
# MongoDB
MONGODB_URI=mongodb://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...

# Stripe (TEST MODE actuel)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Brevo)
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...

# Cron Jobs
CRON_SECRET=...

# N8N
N8N_WEBHOOK_SECRET=...
```

#### Variables Production à Configurer

**Sur Northflank** :

**MongoDB** :
- [ ] `MONGODB_URI` → Utiliser MongoDB Atlas production
  - Format : `mongodb+srv://user:password@cluster.mongodb.net/coworking-cafe-prod?retryWrites=true&w=majority`
  - Vérifier : IP Northflank dans whitelist Atlas

**NextAuth** :
- [ ] `NEXTAUTH_URL` → `https://coworkingcafe.fr` (ou ton domaine)
- [ ] `NEXTAUTH_SECRET` → Générer nouveau secret production
  - Commande : `openssl rand -base64 32`

**Stripe** :
- [ ] **Option 1 (Recommandée)** : Garder TEST mode pour tests en prod
  - `STRIPE_SECRET_KEY=sk_test_...` (actuel)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` (actuel)
  - `STRIPE_WEBHOOK_SECRET=whsec_...` (actuel)

- [ ] **Option 2** : Passer en LIVE mode (après tests)
  - `STRIPE_SECRET_KEY=sk_live_...` (clé live Stripe)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` (clé live)
  - `STRIPE_WEBHOOK_SECRET` → Nouveau webhook live à créer

**Email (Brevo)** :
- [ ] `BREVO_API_KEY` → Même clé ou nouvelle clé prod
- [ ] `BREVO_SENDER_EMAIL` → Vérifier domaine vérifié
- [ ] `BREVO_SENDER_NAME` → "CoworKing Café"

**Cron Jobs** :
- [ ] `CRON_SECRET` → Générer nouveau secret
  - Commande : `openssl rand -base64 32`
  - Utiliser dans N8N workflows

**N8N** :
- [ ] `N8N_WEBHOOK_SECRET` → Secret pour webhooks N8N

---

### 3. Configuration Stripe Production

#### Webhook Stripe à Configurer

**URL Webhook** : `https://[ton-domaine]/api/stripe/webhook`

**Événements à écouter** :
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Steps** :
1. Aller sur Stripe Dashboard → Webhooks
2. Créer nouveau endpoint webhook
3. URL : `https://coworkingcafe.fr/api/stripe/webhook`
4. Sélectionner événements ci-dessus
5. Récupérer `Signing secret` (whsec_...)
6. Ajouter dans Northflank : `STRIPE_WEBHOOK_SECRET=whsec_...`

**Test webhook** :
```bash
# Après déploiement
curl -X POST https://coworkingcafe.fr/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{}'

# Devrait retourner 400 (signature invalide) = Webhook fonctionne
```

---

### 4. N8N Cron Jobs

**Workflows à Mettre à Jour** :

#### Send Reminders (10:00)
- [ ] URL : `https://coworkingcafe.fr/api/cron/send-reminders`
- [ ] Headers : `Authorization: Bearer ${CRON_SECRET}`
- [ ] Schedule : Every day at 10:00

#### Check Attendance (10:00)
- [ ] URL : `https://coworkingcafe.fr/api/cron/check-attendance`
- [ ] Headers : `Authorization: Bearer ${CRON_SECRET}`
- [ ] Schedule : Every day at 10:00

#### Daily Report (19:00)
- [ ] URL : `https://coworkingcafe.fr/api/cron/daily-report`
- [ ] Headers : `Authorization: Bearer ${CRON_SECRET}`
- [ ] Schedule : Every day at 19:00

**Note** : Workflows obsolètes (désactiver) :
- create-holds (Stripe 90j)
- capture-deposits (Stripe 90j)
- publish-scheduled (blog supprimé)

---

## 🚀 DÉPLOIEMENT SUR NORTHFLANK

### Étape 1 : Préparer le Build

**Dans apps/site** :

```bash
# Vérifier build local
cd apps/site
pnpm build

# Résultat attendu :
# ✓ Compiled successfully
# ✓ Collecting page data
# ✓ Generating static pages (46/46)
```

**Si erreurs** :
- Corriger avant déploiement
- Re-tester
- Commit + push

---

### Étape 2 : Configuration Northflank

#### A. Créer Nouveau Service (si pas déjà fait)

**Settings** :
- Name : `coworking-site`
- Type : `Combined service (build & deploy)`
- Framework : `Next.js`

**Source** :
- Repository : `Twe-ux/coworking-cafe`
- Branch : `main`
- Build context : `apps/site`

**Build** :
- Build command : `pnpm install && pnpm build`
- Run command : `pnpm start`
- Port : `3000`

#### B. Variables d'Environnement

**Dans Northflank → Service → Environment** :

Copier toutes les variables listées dans section 2 ci-dessus.

**Vérification** :
- [ ] Toutes les variables sont présentes
- [ ] Pas de secrets en clair dans le code
- [ ] MongoDB URI pointe vers production
- [ ] NEXTAUTH_URL = domaine production

#### C. Domaine Personnalisé

**Dans Northflank → Service → Networking** :

- [ ] Ajouter domaine : `coworkingcafe.fr`
- [ ] Configurer DNS :
  - Type : `CNAME`
  - Name : `@` ou `www`
  - Value : `[northflank-domain].northflank.app`
  - TTL : `3600`

- [ ] Activer SSL/TLS (automatique Northflank)

---

### Étape 3 : Déployer

**Option 1 : Auto-deploy (recommandé)**
- Northflank détecte push sur `main`
- Build automatique
- Deploy automatique

**Option 2 : Manual deploy**
- Dans Northflank → Service
- Cliquer "Trigger deploy"
- Attendre build (~5 min)

**Logs à surveiller** :
```bash
# Dans Northflank → Logs
✓ Build completed successfully
✓ Starting Next.js server
✓ Ready on port 3000
```

---

### Étape 4 : Vérifications Post-Déploiement

#### Tests Fonctionnels (30 min)

**Site Public** :
- [ ] Homepage charge correctement
- [ ] Navigation fonctionne
- [ ] Images s'affichent
- [ ] Styles CSS chargés
- [ ] Responsive OK

**Booking Flow** :
- [ ] Page booking/details accessible
- [ ] Formulaire fonctionne
- [ ] Calcul prix OK
- [ ] Page summary affiche recap
- [ ] **NE PAS TESTER PAIEMENT RÉEL** (Stripe test mode)

**Dashboard** :
- [ ] Login fonctionne
- [ ] Dashboard accessible
- [ ] Profile affiche données
- [ ] Modification profile fonctionne

**APIs** :
- [ ] GET /api/spaces → 200 OK
- [ ] GET /api/blog/articles → 200 OK
- [ ] POST /api/contact → Fonctionne

**Cron Jobs** (tester manuellement) :
```bash
# Send Reminders
curl -X POST https://coworkingcafe.fr/api/cron/send-reminders \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Résultat attendu : 200 OK + JSON response
```

#### Tests Sécurité

**HTTPS** :
- [ ] Toutes pages chargent en HTTPS
- [ ] Aucune erreur de certificat
- [ ] Mixed content warnings : 0

**Headers Sécurité** :
```bash
curl -I https://coworkingcafe.fr

# Vérifier headers :
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=...
```

**Auth** :
- [ ] Dashboard redirige vers login si non connecté
- [ ] Routes API protégées retournent 401 si non auth
- [ ] Tokens NextAuth fonctionnent

#### Tests Performance

**Lighthouse** (Chrome DevTools) :
```bash
# Target :
Performance : > 85
Accessibility : > 90
Best Practices : > 90
SEO : > 95
```

**Core Web Vitals** :
- [ ] LCP (Largest Contentful Paint) : < 2.5s
- [ ] FID (First Input Delay) : < 100ms
- [ ] CLS (Cumulative Layout Shift) : < 0.1

---

## 🐛 DEBUGGING EN PRODUCTION

### Logs Northflank

**Accéder aux logs** :
- Northflank → Service → Logs
- Filtrer par niveau : Error, Warning

**Logs utiles** :
```bash
# Erreurs Next.js
[error] Error: ...

# Erreurs MongoDB
MongooseError: ...

# Erreurs Stripe
Stripe error: ...
```

### Erreurs Courantes

**1. Build échoue** :
```bash
Error: Cannot find module 'next'
```
**Solution** : Vérifier `pnpm install` dans build command

**2. MongoDB connection échoue** :
```bash
MongooseError: connect ECONNREFUSED
```
**Solution** : Vérifier MONGODB_URI et IP whitelist Atlas

**3. Images ne chargent pas** :
```bash
Error: Invalid src prop
```
**Solution** : Vérifier domaines images dans `next.config.js`

**4. Stripe webhook échoue** :
```bash
Error: No signatures found matching the expected signature
```
**Solution** : Vérifier STRIPE_WEBHOOK_SECRET

---

## 📋 ROLLBACK PLAN

### Si Problème Critique en Production

**Option 1 : Rollback Build Northflank**
1. Northflank → Service → Builds
2. Sélectionner build précédent stable
3. Cliquer "Redeploy"
4. Attendre redeploy (~2 min)

**Option 2 : Rollback Git**
```bash
# Identifier commit stable
git log --oneline -10

# Revert vers commit stable
git revert <commit-sha>
git push origin main

# Northflank auto-deploy le revert
```

**Option 3 : Hotfix Rapide**
```bash
# Créer branche hotfix
git checkout -b hotfix/production-issue

# Corriger le problème
# ...

# Commit + push
git add .
git commit -m "hotfix: [description]"
git push origin hotfix/production-issue

# Merge dans main
git checkout main
git merge hotfix/production-issue
git push origin main
```

---

## ✅ CHECKLIST FINALE

### Avant Déploiement
- [ ] Tous tests manuels passés
- [ ] Build local réussi
- [ ] Variables d'env préparées
- [ ] Webhook Stripe configuré
- [ ] N8N workflows mis à jour
- [ ] DNS configuré

### Pendant Déploiement
- [ ] Build Northflank réussi
- [ ] Logs propres (pas d'erreurs)
- [ ] App démarre correctement
- [ ] HTTPS actif

### Après Déploiement
- [ ] Homepage charge
- [ ] Navigation fonctionne
- [ ] Login fonctionne
- [ ] APIs fonctionnent
- [ ] Cron jobs testés
- [ ] Lighthouse > 85
- [ ] 0 erreur console

### Monitoring (Première Semaine)
- [ ] Surveiller logs quotidiennement
- [ ] Surveiller métriques performance
- [ ] Tester booking flow réel (Stripe test)
- [ ] Vérifier emails envoyés
- [ ] Vérifier cron jobs s'exécutent

---

## 📞 SUPPORT

### Ressources

**Documentation** :
- `docs/POINT_REFACTO_29_JAN_2026.md` - État du code
- `docs/testing/MANUEL_TEST_REFACTO.md` - Guide de test
- `apps/site/CLAUDE.md` - Documentation app

**Logs** :
- Northflank → Logs
- MongoDB Atlas → Logs
- Stripe Dashboard → Webhooks logs
- N8N → Execution logs

**Contacts** :
- Northflank Support : support@northflank.com
- Stripe Support : Dashboard → Help
- MongoDB Support : Atlas Support

---

## 🎉 DÉPLOIEMENT RÉUSSI !

**Prochaines étapes après déploiement** :

1. **Monitoring** (J+1 à J+7)
   - Surveiller logs
   - Surveiller performance
   - Corriger bugs mineurs

2. **Tests Utilisateurs** (J+7)
   - Inviter beta testeurs
   - Récolter feedback
   - Améliorer UX

3. **Optimisations** (J+14)
   - Analyser métriques
   - Optimiser performance
   - Refactorisation composants (si souhaité)

4. **Stripe LIVE Mode** (Après validation)
   - Basculer en mode live
   - Configurer webhook live
   - Tester paiement réel

---

**Bon déploiement ! 🚀**

_Créé le 2026-01-29_
