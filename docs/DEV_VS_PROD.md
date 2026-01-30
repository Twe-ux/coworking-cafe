# 🔄 Environnements : Développement vs Production

> Guide pour gérer correctement les environnements dev et prod
> Date : 2026-01-30

---

## ⚠️ RÈGLE D'OR

**JAMAIS de données de production en développement !**

Le développement local DOIT utiliser :
- ✅ Un cluster MongoDB DEV
- ✅ Une database DEV (`coworking_cafe_dev`)
- ✅ Des données de test (pas de vraies données clients)

---

## 🏗️ Architecture des Environnements

```
┌─────────────────────────────────────────────────────┐
│                  DÉVELOPPEMENT                      │
├─────────────────────────────────────────────────────┤
│ Machine locale (MacBook)                            │
│                                                     │
│ apps/admin/.env.local                               │
│ ├── MONGODB_URI → Cluster DEV                       │
│ │   mongodb+srv://dev:pass@coworking.mongodb.net/  │
│ │   coworking_cafe_dev                              │
│ │                                                    │
│ ├── NEXTAUTH_URL=http://localhost:3001              │
│ └── Toutes clés en mode TEST                        │
│                                                     │
│ MongoDB Atlas                                        │
│ └── Cluster: coworking (M0 Free ou M2)              │
│     └── Database: coworking_cafe_dev                 │
│         ├── admins (compte test)                     │
│         ├── employees (données test)                 │
│         └── users (données test)                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   PRODUCTION                        │
├─────────────────────────────────────────────────────┤
│ Vercel (apps/admin + apps/site)                     │
│ Northflank (socket-server)                          │
│                                                     │
│ Vercel Environment Variables                        │
│ ├── MONGODB_URI → Cluster PROD                      │
│ │   mongodb+srv://admin-prod:pass@                  │
│ │   coworking-cafe-prod.mongodb.net/                │
│ │   coworking_cafe_prod                              │
│ │                                                    │
│ ├── NEXTAUTH_URL=https://admin.coworkingcafe.fr     │
│ └── Toutes clés en mode LIVE                        │
│                                                     │
│ MongoDB Atlas                                        │
│ └── Cluster: coworking-cafe-prod (M10+)             │
│     └── Database: coworking_cafe_prod                │
│         ├── admins (comptes réels)                   │
│         ├── employees (données réelles)              │
│         └── users (clients réels)                    │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Configuration par Environnement

### DÉVELOPPEMENT (Local)

**Fichier** : `apps/admin/.env.local`

```bash
# MongoDB - CLUSTER DEV
MONGODB_URI=mongodb+srv://dev:PASSWORD@coworking.jhxdixz.mongodb.net/coworking_cafe_dev

# NextAuth - Local
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-not-for-production

# Stripe - TEST MODE
STRIPE_SECRET_KEY=sk_test_...
STRIPE_LIVE_MODE=false

# Resend - DEV
RESEND_FROM_EMAIL=onboarding@resend.dev

# IP Whitelist - Ouvert en dev
ALLOWED_STAFF_IPS=
```

**Compte Admin Dev** :
- Email: `dev@coworkingcafe.fr`
- Password: `dev123`
- Rôle: `dev`

---

### PRODUCTION (Vercel)

**Lieu** : Vercel Dashboard → Settings → Environment Variables

```bash
# MongoDB - CLUSTER PROD
MONGODB_URI=mongodb+srv://admin-prod:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod

# NextAuth - Production
NEXTAUTH_URL=https://admin.coworkingcafe.fr
NEXTAUTH_SECRET=LONG-RANDOM-SECRET-64-CHARS-MIN

# Stripe - LIVE MODE (après tests !)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_LIVE_MODE=true

# Resend - Production
RESEND_FROM_EMAIL=noreply@coworkingcafe.fr

# IP Whitelist - Restreint
ALLOWED_STAFF_IPS=192.168.1.100,10.0.0.50
```

**Compte Admin Prod** :
- Email: `dev@coworkingcafe.fr`
- Password: `Dev123456!` (fort)
- Rôle: `dev`

---

## 🛠️ Setup Initial

### 1. Configurer le Cluster Dev

**MongoDB Atlas** :

1. Créer/utiliser le cluster existant `coworking` (M0 Free OK)
2. Database Access → Utilisateur `dev` déjà créé
3. Network Access → Autoriser votre IP OU `0.0.0.0/0` (dev seulement)

### 2. Initialiser la Database Dev

```bash
# Créer les collections et un admin de test
MONGODB_URI_DEV="mongodb+srv://dev:***REMOVED***@coworking.jhxdixz.mongodb.net/coworking_cafe_dev" node scripts/setup-dev-database.js
```

**Résultat** :
- ✅ Database `coworking_cafe_dev` créée
- ✅ Collections créées (admins, users, employees, etc.)
- ✅ Admin dev créé : `dev@coworkingcafe.fr` / `dev123`
- ✅ Données de test ajoutées

### 3. Vérifier .env.local

```bash
# apps/admin/.env.local DOIT pointer vers DEV
cat apps/admin/.env.local | grep MONGODB_URI

# Attendu :
# MONGODB_URI=mongodb+srv://dev:...@coworking.jhxdixz.mongodb.net/coworking_cafe_dev
#                              ^^^    ^^^^^^^^                      ^^^^^^^^^^^^^^^^^^
#                              User   Cluster DEV                   Database DEV
```

### 4. Tester en Local

```bash
cd apps/admin
pnpm dev

# → http://localhost:3001/login
# Email: dev@coworkingcafe.fr
# Password: dev123
```

---

## ✅ Vérifications de Sécurité

### Checklist Dev

- [ ] `.env.local` pointe vers cluster DEV (pas prod)
- [ ] Database name = `coworking_cafe_dev`
- [ ] Compte admin de test existe
- [ ] Stripe en mode TEST (`STRIPE_LIVE_MODE=false`)
- [ ] Pas de données réelles en dev

### Checklist Prod

- [ ] Vercel pointe vers cluster PROD
- [ ] Database name = `coworking_cafe_prod`
- [ ] Compte admin avec mot de passe fort
- [ ] IP Whitelist configurée (pas `0.0.0.0/0`)
- [ ] Stripe en mode LIVE (après tests complets)
- [ ] Backup automatiques activés

---

## 🔄 Workflow de Développement

### 1. Développer en Local

```bash
# Toujours travailler avec la DB dev
cd apps/admin
pnpm dev

# Test avec données de test
# Pas de risque pour la prod
```

### 2. Tester les Changements

```bash
# Tests unitaires
pnpm test

# Type check
pnpm type-check

# Build
pnpm build
```

### 3. Commit & Push

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

### 4. Deploy Automatique

```
GitHub → Vercel (auto)
├── Build apps/admin
├── Use PROD env vars
└── Deploy to admin.coworkingcafe.fr
```

**La prod utilise automatiquement les bonnes variables !**

---

## 🚨 Erreurs Courantes

### Erreur 1 : Dev pointe vers Prod

**Symptôme** : Modifications en dev apparaissent en prod

**Cause** : `.env.local` pointe vers cluster prod

**Solution** :
```bash
# Vérifier l'URI
cat apps/admin/.env.local | grep MONGODB_URI

# Doit contenir : @coworking.jhxdixz.mongodb.net/coworking_cafe_dev
# PAS : @coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod
```

---

### Erreur 2 : Prod utilise Dev

**Symptôme** : Production ne trouve pas les données

**Cause** : Vercel pointe vers cluster dev

**Solution** :
```bash
# Vérifier Vercel env vars
vercel env ls

# MONGODB_URI doit pointer vers cluster PROD
vercel env add MONGODB_URI production
# Coller l'URI PROD
```

---

### Erreur 3 : Données Test en Prod

**Symptôme** : Clients voient des données de test

**Cause** : Migration accidentelle dev → prod

**Solution** :
```bash
# JAMAIS migrer dev → prod
# Toujours prod → dev si besoin de données réelles pour tester

# Restaurer backup prod
# MongoDB Atlas → Backups → Restore
```

---

## 📊 Comparaison Dev vs Prod

| Aspect | DEV | PROD |
|--------|-----|------|
| **MongoDB** | | |
| Cluster | `coworking` (M0) | `coworking-cafe-prod` (M10+) |
| Database | `coworking_cafe_dev` | `coworking_cafe_prod` |
| User | `dev` | `admin-prod`, `site-prod`, `socket-prod` |
| IP Whitelist | Ouvert ou votre IP | Vercel + Northflank seulement |
| **NextAuth** | | |
| URL | `http://localhost:3001` | `https://admin.coworkingcafe.fr` |
| Secret | Court (dev) | Long + aléatoire (64+ chars) |
| **Stripe** | | |
| Mode | TEST (`sk_test_...`) | LIVE (`sk_live_...`) |
| Webhook | Localhost test | URL production |
| **Email** | | |
| From | `onboarding@resend.dev` | `noreply@coworkingcafe.fr` |
| **Sécurité** | | |
| IP Staff | Désactivé (`""`) | Activé (IPs spécifiques) |
| Secrets | Simples | Forts (32+ chars) |
| **Données** | | |
| Type | Données de test | Données réelles clients |
| Backup | Optionnel | Obligatoire (quotidien) |

---

## 🔐 Rotation des Secrets

### Dev (Optionnel)

Les secrets dev peuvent être simples et partagés dans l'équipe.

### Prod (Obligatoire tous les 90 jours)

```bash
# 1. Générer nouveaux secrets
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # NOTIFICATIONS_SECRET
npx web-push generate-vapid-keys  # VAPID

# 2. Mettre à jour Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production
# ... répéter pour tous les secrets

# 3. Redéployer
vercel --prod

# 4. Tester que tout fonctionne
```

---

## 📚 Documentation Liée

- MongoDB Atlas Setup : `docs/MONGODB_ATLAS_SETUP.md`
- Collections Architecture : `apps/admin/COLLECTIONS_ARCHITECTURE.md`
- Security Guide : `apps/admin/SECURITY.md`

---

**Dernière mise à jour** : 2026-01-30
**Règle d'or** : Dev = Données test, Prod = Données réelles, JAMAIS mélanger !
