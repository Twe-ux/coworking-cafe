# 🚨 PROCÉDURE URGENTE - Révoquer Credentials MongoDB

**Date**: 2026-01-30
**Gravité**: CRITIQUE
**Status**: 🔴 ACTION REQUISE IMMÉDIATEMENT

---

## ⚠️ CREDENTIALS EXPOSÉS SUR GITHUB

```
admin-prod: G4mgKELvkqNeUtQicRG8Zem4CSxHPana
dev: MzAo7OOuM30AKHCw
```

**Fichiers**: `docs/UPDATE_MONGODB_URI.md`, `docs/DEV_VS_PROD.md`
**Commits**: Pushés sur GitHub (publics)

---

## 🔥 ÉTAPE 1: RÉVOQUER IMMÉDIATEMENT (5 min)

### A. Ouvrir MongoDB Atlas

```bash
# 1. Aller sur https://cloud.mongodb.com/
```

### B. Cluster PROD (coworking-cafe-prod)

```
1. Cliquer sur "Database Access" (menu gauche)
2. Trouver l'utilisateur: admin-prod
3. Cliquer sur "..." (trois points) → DELETE
4. Confirmer la suppression
```

⚠️ **ATTENTION**: Cela va CASSER la production temporairement

### C. Cluster DEV (coworking)

```
1. Database Access
2. Trouver l'utilisateur: dev
3. DELETE
4. Confirmer
```

---

## 🔑 ÉTAPE 2: CRÉER NOUVEAUX UTILISATEURS (5 min)

### A. Générer de Nouveaux Passwords

```bash
# Sur votre terminal
openssl rand -base64 32
# Copier le résultat → Nouveau password admin-prod-v2

openssl rand -base64 32
# Copier le résultat → Nouveau password dev-v2
```

### B. Créer admin-prod-v2 (Production)

```
MongoDB Atlas → Database Access → Add New Database User

Username: admin-prod-v2
Authentication Method: Password
Password: [Coller le nouveau password généré]
Database User Privileges: Read and write to any database
Restrict Access to Specific Clusters: coworking-cafe-prod
```

Cliquer **Add User**

### C. Créer dev-v2 (Development)

```
Add New Database User

Username: dev-v2
Password: [Coller le nouveau password généré]
Privileges: Read and write to any database
Restrict Access: coworking (cluster dev)
```

Cliquer **Add User**

---

## 🔄 ÉTAPE 3: METTRE À JOUR .env.local (2 min)

```bash
# Ouvrir le fichier
code apps/admin/.env.local

# Remplacer la ligne MONGODB_URI par:
MONGODB_URI=mongodb+srv://dev-v2:NOUVEAU_PASSWORD_DEV@coworking.jhxdixz.mongodb.net/coworking_cafe_dev
```

**IMPORTANT**: Remplacer `NOUVEAU_PASSWORD_DEV` par le vrai password généré

---

## ☁️ ÉTAPE 4: METTRE À JOUR VERCEL (5 min)

### Option A: Via CLI (Rapide)

```bash
# Supprimer l'ancienne variable
vercel env rm MONGODB_URI production

# Ajouter la nouvelle
vercel env add MONGODB_URI production
# Quand demandé, coller:
# mongodb+srv://admin-prod-v2:NOUVEAU_PASSWORD_PROD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod

# Redéployer
vercel --prod
```

### Option B: Via Dashboard Vercel

```
1. https://vercel.com/dashboard
2. Sélectionner le projet "admin"
3. Settings → Environment Variables
4. Trouver MONGODB_URI
5. Cliquer Edit
6. Remplacer par:
   mongodb+srv://admin-prod-v2:NOUVEAU_PASSWORD_PROD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod
7. Save
8. Deployments → Latest → Redeploy
```

---

## ✅ ÉTAPE 5: TESTER (5 min)

### A. Test Local (Dev)

```bash
cd apps/admin
pnpm dev

# Ouvrir http://localhost:3001/login
# Email: dev@coworkingcafe.fr
# Password: dev123
```

✅ Si vous pouvez vous connecter → OK

### B. Test Production

```
1. Ouvrir https://admin.coworkingcafe.fr/login
2. Se connecter avec compte admin prod
```

✅ Si connexion OK → Production restaurée

---

## 📋 CHECKLIST

- [ ] **URGENT**: Supprimer utilisateur `admin-prod` dans MongoDB Atlas
- [ ] **URGENT**: Supprimer utilisateur `dev` dans MongoDB Atlas
- [ ] Générer 2 nouveaux passwords (openssl)
- [ ] Créer `admin-prod-v2` dans cluster PROD
- [ ] Créer `dev-v2` dans cluster DEV
- [ ] Mettre à jour `.env.local` avec nouveau dev password
- [ ] Mettre à jour Vercel avec nouveau prod password
- [ ] Redéployer Vercel
- [ ] Tester login local
- [ ] Tester login production
- [ ] ✅ Production restaurée et sécurisée

---

## 🧹 ÉTAPE 6: NETTOYER GIT (Optionnel, après sécurisation)

**IMPORTANT**: Ne faire cette étape QU'APRÈS avoir révoqué les credentials

Voir le fichier `GIT_HISTORY_CLEANUP.md` pour les instructions de nettoyage de l'historique Git.

---

**TEMPS TOTAL ESTIMÉ**: 20-25 minutes

**PRIORITÉ**: Faire les étapes 1-5 MAINTENANT, étape 6 peut attendre.
