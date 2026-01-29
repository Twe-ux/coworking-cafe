# 📋 CE QU'IL RESTE À FAIRE AVANT DÉPLOIEMENT

**Date** : 2026-01-29
**Status** : Code prêt, configuration production à finaliser

---

## ✅ CE QUI EST DÉJÀ FAIT

### Option A - Sécurité ✅
- ✅ Secrets hardcodés retirés du code
- ✅ Git hooks installés (protection pré-commit)
- ✅ `.env.example` créés pour site + admin
- ✅ Documentation sécurité complète

### Option B - Configuration Northflank ✅
- ✅ Fichiers `northflank.json` mis à jour (3 fichiers)
- ✅ URLs localhost remplacées par variables d'environnement
- ✅ 43 variables d'environnement documentées

### Option C - Build Local ✅
- ✅ Build apps/site réussi (50/50 pages)
- ✅ Build apps/admin réussi (20+ pages)
- ✅ Build apps/socket-server réussi
- ✅ 0 erreur bloquante
- ✅ Code prêt pour déploiement

---

## ⚠️ CE QU'IL RESTE À FAIRE (4 TÂCHES CRITIQUES)

### 1. 🔐 RÉGÉNÉRER TOUS LES SECRETS (P0 - CRITIQUE)

**Temps estimé** : 30-45 minutes
**Référence** : `KEYS_TO_REGENERATE.md`

| Service | Action | Commande/Méthode |
|---------|--------|------------------|
| **MongoDB Password** | Créer nouveau user prod | MongoDB Atlas > Database Access |
| **NextAuth Secret (x2)** | Générer 2 secrets différents | `openssl rand -base64 32` |
| **Stripe Webhook Secrets** | Créer webhooks prod | Stripe Dashboard > Webhooks |
| **Resend API Key** | Régénérer clé | Resend Dashboard > API Keys |
| **Cloudinary API Secret** | Reset secret | Cloudinary Console > Settings |
| **Secrets Inter-Services (x2)** | Générer identique site+admin | `openssl rand -hex 32` |
| **VAPID Keys (x2)** | Générer paire clés | `npx web-push generate-vapid-keys` |
| **Hiboutik API Key** | Régénérer | Hiboutik Settings |

**Checklist détaillée** :
- [ ] Générer tous les secrets localement
- [ ] Créer un fichier temporaire `.secrets-prod.txt` (à supprimer après)
- [ ] Copier les secrets dans ce fichier
- [ ] Configurer dans Northflank (étape suivante)
- [ ] Supprimer le fichier temporaire
- [ ] Ne JAMAIS commit les secrets

---

### 2. ⚙️ CONFIGURER NORTHFLANK (P0 - CRITIQUE)

**Temps estimé** : 20-30 minutes
**Prérequis** : Avoir généré tous les secrets (étape 1)

#### Étape 2.1 : Créer les services Northflank

```bash
# Sur Northflank (interface web)
1. Créer un nouveau projet "coworking-cafe"
2. Connecter le repository GitHub
3. Créer 3 services :
   - Service "site" (port 3000)
   - Service "admin" (port 3001)
   - Service "socket-server" (port 3002)
```

#### Étape 2.2 : Configurer les variables d'environnement

**Pour le service "site"** (14 variables) :
```bash
NEXTAUTH_URL=https://[votre-domaine].com
NEXTAUTH_SECRET=[secret généré étape 1]
MONGODB_URI=mongodb+srv://<PROD_USER>:<STRONG_PASSWORD>@your-cluster.mongodb.net/db-name
RESEND_API_KEY=[clé générée étape 1]
RESEND_FROM_EMAIL=noreply@[votre-domaine].com
CLOUDINARY_CLOUD_NAME=[votre cloud]
CLOUDINARY_API_KEY=[votre clé]
CLOUDINARY_API_SECRET=[secret généré étape 1]
NEXT_PUBLIC_ADMIN_API_URL=https://admin.[votre-domaine].com
STRIPE_SECRET_KEY=sk_live_[clé Stripe]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[clé Stripe]
STRIPE_WEBHOOK_SECRET=[secret généré étape 1]
STRIPE_LIVE_MODE=true
NOTIFICATIONS_SECRET=[secret inter-services]
```

**Pour le service "admin"** : Copier toutes les variables du site + ajouter les spécifiques admin

**Pour le service "socket-server"** : Variables minimales (MongoDB, secrets)

#### Étape 2.3 : Configurer les domaines

```bash
# Dans Northflank > Service Settings > Networking
1. Ajouter custom domain pour "site" : votredomaine.com
2. Ajouter custom domain pour "admin" : admin.votredomaine.com
3. Ajouter custom domain pour "socket" : socket.votredomaine.com
4. Activer HTTPS automatique (Let's Encrypt)
```

**Checklist Northflank** :
- [ ] Projet créé
- [ ] Repository GitHub connecté
- [ ] 3 services créés (site, admin, socket)
- [ ] Variables d'environnement configurées (toutes)
- [ ] Domaines personnalisés configurés
- [ ] HTTPS activé
- [ ] Build settings configurés (détectés depuis northflank.json)

---

### 3. 🗄️ CONFIGURER MONGODB PRODUCTION (P0 - CRITIQUE)

**Temps estimé** : 15-20 minutes

#### Étape 3.1 : Créer les users production

```bash
# MongoDB Atlas > Security > Database Access

1. Créer user "prod-site"
   - Password : [générer password fort 32+ caractères]
   - Permissions : readWrite sur database "coworking-cafe-site"
   - Sauvegarder le password dans .secrets-prod.txt

2. Créer user "prod-admin"
   - Password : [générer password fort 32+ caractères]
   - Permissions : readWrite sur database "coworking-cafe-admin"
   - Sauvegarder le password dans .secrets-prod.txt
```

#### Étape 3.2 : Configurer Network Access

```bash
# MongoDB Atlas > Security > Network Access

1. Récupérer les IPs Northflank :
   - Aller dans Northflank > Project Settings > Networking
   - Copier les IPs statiques

2. Ajouter les IPs dans MongoDB Atlas :
   - Ajouter chaque IP Northflank à la whitelist
   - NE PAS mettre 0.0.0.0/0 (trop permissif)
```

#### Étape 3.3 : Mettre à jour les URIs MongoDB

```bash
# Dans Northflank, mettre à jour les variables :

# Service "site"
MONGODB_URI=mongodb+srv://<PROD_SITE_USER>:<PASSWORD>@your-cluster.mongodb.net/coworking-cafe-site?retryWrites=true&w=majority

# Service "admin"
MONGODB_URI=mongodb+srv://<PROD_ADMIN_USER>:<PASSWORD>@your-cluster.mongodb.net/coworking-cafe-admin?retryWrites=true&w=majority
```

**Checklist MongoDB** :
- [ ] User `prod-site` créé avec permissions restreintes
- [ ] User `prod-admin` créé avec permissions restreintes
- [ ] IPs Northflank ajoutées à la whitelist
- [ ] 2 databases séparées créées (site / admin)
- [ ] URIs MongoDB mises à jour dans Northflank
- [ ] Connection testée (via Northflank logs)

---

### 4. 🎯 CONFIGURER STRIPE WEBHOOKS PRODUCTION (P0 - CRITIQUE)

**Temps estimé** : 10-15 minutes

#### Étape 4.1 : Créer les webhooks dans Stripe Dashboard

```bash
# https://dashboard.stripe.com/webhooks

1. Webhook pour "site" :
   - URL : https://[votre-domaine].com/api/payments/webhook
   - Événements à écouter :
     - checkout.session.completed
     - payment_intent.succeeded
     - payment_intent.payment_failed
     - charge.refunded
   - Copier le Webhook Secret généré

2. Webhook pour "admin" :
   - URL : https://admin.[votre-domaine].com/api/stripe/webhook
   - Événements à écouter :
     - checkout.session.completed
     - payment_intent.succeeded
     - payment_intent.payment_failed
     - charge.refunded
   - Copier le Webhook Secret généré
```

#### Étape 4.2 : Mettre à jour les secrets dans Northflank

```bash
# Dans Northflank > Service "site" > Environment Variables
STRIPE_WEBHOOK_SECRET=[secret du webhook site]

# Dans Northflank > Service "admin" > Environment Variables
STRIPE_WEBHOOK_SECRET=[secret du webhook admin]
```

**Checklist Stripe** :
- [ ] Webhook "site" créé dans Stripe Dashboard
- [ ] Webhook "admin" créé dans Stripe Dashboard
- [ ] Secrets webhook copiés dans Northflank
- [ ] Mode LIVE activé (`STRIPE_LIVE_MODE=true`)
- [ ] Clés LIVE configurées (pk_live_ et sk_live_)
- [ ] Test webhook effectué (via Stripe CLI ou test payment)

---

## 🔄 OPTIONNEL (HAUTE PRIORITÉ - RECOMMANDÉ)

### 5. 📧 Configurer le Domaine Email (Resend)

**Temps estimé** : 20-30 minutes
**Impact** : Améliore délivrabilité des emails

```bash
# https://resend.com/domains

1. Ajouter domaine personnalisé
2. Configurer DNS records :
   - SPF : TXT @ "v=spf1 include:resend.io ~all"
   - DKIM : TXT [fourni par Resend]
   - DMARC : TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@[votre-domaine].com"
3. Vérifier le domaine (peut prendre 24-48h)
4. Mettre à jour RESEND_FROM_EMAIL dans Northflank
```

**Checklist Email** :
- [ ] Domaine ajouté dans Resend
- [ ] SPF record configuré dans DNS
- [ ] DKIM record configuré dans DNS
- [ ] DMARC record configuré dans DNS
- [ ] Domaine vérifié (statut "Verified")
- [ ] Variable `RESEND_FROM_EMAIL` mise à jour

---

## 🚀 DÉPLOIEMENT

### Étape Finale : Déployer sur Northflank

**Prérequis** :
- ✅ Toutes les 4 tâches critiques complétées
- ✅ Secrets générés et configurés
- ✅ MongoDB production configuré
- ✅ Webhooks Stripe créés

**Commandes** :

```bash
# 1. Commit final (si modifications)
git add .
git commit -m "chore: prepare production deployment"
git push origin main

# 2. Déployer sur Northflank
# Option A : Déploiement automatique (si configuré)
# Northflank détectera le push et déploiera automatiquement

# Option B : Déploiement manuel
# Dans Northflank > Services > Cliquer "Deploy"
```

**Vérifications post-déploiement** :
```bash
# 1. Vérifier que les services démarrent
# Northflank > Services > Logs > Vérifier "Server started on port..."

# 2. Tester les URLs
curl https://[votre-domaine].com
curl https://admin.[votre-domaine].com
curl https://socket.[votre-domaine].com

# 3. Tester une fonctionnalité critique
# - Ouvrir https://[votre-domaine].com/booking
# - Créer une réservation test
# - Vérifier email de confirmation
```

---

## 📊 RÉCAPITULATIF

### Tâches par Priorité

| Tâche | Priorité | Temps | Bloquant ? |
|-------|----------|-------|------------|
| **1. Régénérer secrets** | P0 | 30-45 min | ✅ OUI |
| **2. Configurer Northflank** | P0 | 20-30 min | ✅ OUI |
| **3. Configurer MongoDB** | P0 | 15-20 min | ✅ OUI |
| **4. Webhooks Stripe** | P0 | 10-15 min | ✅ OUI |
| **5. Domaine Email** | P1 | 20-30 min | ⚠️ Recommandé |

**Temps total minimum** : 1h15 - 1h45
**Temps total recommandé** : 1h35 - 2h15 (avec email)

### Ordre d'Exécution Recommandé

1. **Générer tous les secrets** (30-45 min)
   → Créer `.secrets-prod.txt` temporaire

2. **Configurer MongoDB** (15-20 min)
   → Créer users, configurer network access

3. **Configurer Northflank** (20-30 min)
   → Créer services, copier secrets depuis `.secrets-prod.txt`

4. **Configurer Webhooks Stripe** (10-15 min)
   → Créer webhooks, copier secrets dans Northflank

5. **[OPTIONNEL] Configurer Email** (20-30 min)
   → Ajouter domaine, configurer DNS

6. **Déployer** (5-10 min)
   → Push git, vérifier déploiement

7. **Supprimer `.secrets-prod.txt`** ⚠️ IMPORTANT
   → Ne jamais commit ce fichier

---

## 📚 RÉFÉRENCES

- **Sécurité** : `SECURITY_AUDIT.md`, `KEYS_TO_REGENERATE.md`
- **Configuration** : `OPTION_B_NORTHFLANK.md`, `URL_LOCALHOST_CORRECTIONS.md`
- **Build** : `OPTION_C_BUILD_RESULTS.md`
- **Checklist globale** : `PRE_DEPLOYMENT_CHECKLIST.md`

---

## ✅ CHECKLIST FINALE

**Avant de déployer, cocher TOUTES ces cases** :

### Code
- [x] ✅ Build local réussi (3/3 apps)
- [x] ✅ Aucun secret hardcodé dans le code
- [x] ✅ Variables d'environnement documentées
- [x] ✅ URLs localhost remplacées par env vars

### Configuration Production
- [ ] ⏳ Secrets générés et sauvegardés temporairement
- [ ] ⏳ MongoDB users production créés
- [ ] ⏳ MongoDB IPs Northflank whitelistées
- [ ] ⏳ Services Northflank créés (site, admin, socket)
- [ ] ⏳ Variables d'environnement configurées dans Northflank
- [ ] ⏳ Domaines personnalisés configurés
- [ ] ⏳ Webhooks Stripe créés et configurés
- [ ] ⏳ [OPTIONNEL] Domaine email configuré

### Post-Déploiement
- [ ] ⏳ Services démarrés sans erreur (vérifier logs)
- [ ] ⏳ URLs accessibles (HTTPS actif)
- [ ] ⏳ Test réservation fonctionnel
- [ ] ⏳ Email de confirmation reçu
- [ ] ⏳ Webhook Stripe testé (paiement test)
- [ ] ⏳ Fichier `.secrets-prod.txt` supprimé

---

**Dernière mise à jour** : 2026-01-29 10:45
**Status** : Prêt pour configuration production
**Prochaine étape** : Régénérer les secrets (Tâche 1)
