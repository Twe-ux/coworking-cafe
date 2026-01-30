# 🔄 Migration Database : coworking-admin → coworking_cafe_prod

> Guide pour pointer toutes les apps vers la nouvelle database
> Date : 2026-01-30

---

## 🎯 Problème Identifié

Vous avez **2 databases** dans MongoDB Atlas :

```
❌ coworking-admin (ancienne)
   └── Contient toutes les collections

✅ coworking_cafe_prod (nouvelle)
   └── Contient la collection admins + structure propre
```

**Solution** : Pointer toutes les URIs vers `coworking_cafe_prod`

---

## 📝 Nouvelle URI à Utiliser Partout

```bash
mongodb+srv://admin-prod:***REMOVED***@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod?retryWrites=true&w=majority
#                                                                                                      ^^^^^^^^^^^^^^^^^^^
#                                                                                                      Nouvelle DB
```

**Changement** : `/coworking-admin` → `/coworking_cafe_prod`

---

## 🔧 Où Mettre à Jour l'URI

### 1. Développement Local ✅ (FAIT)

**apps/admin/.env.local**
```bash
MONGODB_URI=mongodb+srv://admin-prod:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod
```

**apps/site/.env.local** (si existe)
```bash
MONGODB_URI=mongodb+srv://site-prod:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod
```

---

### 2. Vercel Production (apps/admin) 🔴 À FAIRE

#### Méthode A : Via Vercel Dashboard (Recommandé)

1. **Aller sur Vercel**
   - https://vercel.com/dashboard
   - Sélectionner le projet `admin` (ou nom de votre projet admin)

2. **Ouvrir Settings → Environment Variables**

3. **Modifier MONGODB_URI**
   - Cliquer sur l'icône ⋯ à côté de `MONGODB_URI`
   - Cliquer "Edit"
   - Remplacer la valeur par :
     ```
     mongodb+srv://admin-prod:***REMOVED***@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod?retryWrites=true&w=majority
     ```
   - Sélectionner les environnements : `Production`, `Preview`, `Development`
   - Cliquer "Save"

4. **Redéployer**
   - Aller dans l'onglet "Deployments"
   - Cliquer sur le dernier déploiement
   - Cliquer "⋯" → "Redeploy"
   - Ou forcer un nouveau commit :
     ```bash
     git commit --allow-empty -m "chore: redeploy with new MONGODB_URI"
     git push origin main
     ```

#### Méthode B : Via Vercel CLI

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Aller dans le dossier admin
cd apps/admin

# 4. Supprimer l'ancienne variable
vercel env rm MONGODB_URI production

# 5. Ajouter la nouvelle
vercel env add MONGODB_URI production
# Coller l'URI ci-dessus quand demandé

# 6. Redéployer
vercel --prod
```

---

### 3. Vercel Production (apps/site) 🔴 À FAIRE

**Même procédure** que pour apps/admin :

```bash
# Via CLI
cd apps/site
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI production
# Coller : mongodb+srv://site-prod:PASSWORD@...coworking_cafe_prod
vercel --prod
```

---

### 4. Northflank (socket-server) 🔴 À FAIRE

1. **Aller sur Northflank Dashboard**
   - https://app.northflank.com/

2. **Sélectionner votre service socket-server**

3. **Aller dans Environment Variables**

4. **Modifier MONGODB_URI**
   ```
   mongodb+srv://socket-prod:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod?retryWrites=true&w=majority
   ```

5. **Redémarrer le service**

---

## 📦 Migration des Données (SI NÉCESSAIRE)

Si `coworking-admin` contient des données importantes qu'il faut garder, migrons-les vers `coworking_cafe_prod`.

### Option A : Migration Complète (Recommandé)

```bash
# 1. Export de coworking-admin
mongodump --uri="mongodb+srv://admin-prod:PASSWORD@cluster.mongodb.net/coworking-admin" --out=./backup-coworking-admin

# 2. Import vers coworking_cafe_prod
mongorestore --uri="mongodb+srv://admin-prod:PASSWORD@cluster.mongodb.net/coworking_cafe_prod" ./backup-coworking-admin/coworking-admin

# 3. Vérifier dans MongoDB Compass
# → coworking_cafe_prod doit contenir toutes les collections
```

### Option B : Migration Sélective (Collections Importantes)

```javascript
// Dans MongoDB Compass ou mongosh

// 1. Se connecter à coworking-admin (source)
use coworking-admin

// 2. Exporter les collections importantes
// Exemple : employees, bookings, payments, etc.

// Pour chaque collection :
db.employees.find().forEach(function(doc) {
  // Se connecter à coworking_cafe_prod (destination)
  db.getSiblingDB('coworking_cafe_prod').employees.insertOne(doc);
});

// Répéter pour chaque collection nécessaire
```

### Option C : Dupliquer la Database (Plus Simple)

**Via MongoDB Atlas Web UI** :

1. Aller dans MongoDB Atlas → Clusters
2. Cliquer sur "⋯" à côté de `coworking-admin`
3. "Clone Database"
4. Nom de destination : `coworking_cafe_prod`
5. Confirmer

---

## ✅ Checklist de Migration

### Préparation
- [ ] Backup de `coworking-admin` (par sécurité)
- [ ] Compte `admins` créé dans `coworking_cafe_prod`
- [ ] Vérifier que `coworking_cafe_prod` est prête

### Migration Base de Données
- [ ] **Option 1** : Migrer toutes les données de `coworking-admin` → `coworking_cafe_prod`
- [ ] **Option 2** : Utiliser `coworking_cafe_prod` vide et recréer les données

### Mise à Jour URIs
- [ ] ✅ apps/admin/.env.local (dev) → `coworking_cafe_prod`
- [ ] apps/site/.env.local (dev) → `coworking_cafe_prod`
- [ ] Vercel apps/admin (prod) → `coworking_cafe_prod`
- [ ] Vercel apps/site (prod) → `coworking_cafe_prod`
- [ ] Northflank socket-server (prod) → `coworking_cafe_prod`

### Tests
- [ ] Test login admin local (http://localhost:3001/login)
- [ ] Test login admin prod (https://admin.coworkingcafe.fr/login)
- [ ] Vérifier que les données sont présentes
- [ ] Tester les fonctionnalités principales

### Nettoyage (Optionnel)
- [ ] Supprimer `coworking-admin` dans MongoDB Atlas (après validation)
- [ ] Archiver les backups

---

## 🚨 Points d'Attention

### 1. Collections Nécessaires

**Vérifier que `coworking_cafe_prod` contient** :

```
✅ admins (nouveau, créé manuellement)
✅ employees (RH)
✅ shifts (planning)
✅ timeEntries (pointage)
✅ users (clients site)
✅ bookings (réservations)
✅ payments (paiements)
✅ ... (autres collections métier)
```

### 2. Index à Recréer

Si migration manuelle, **recréer les index** :

```javascript
// Exemple pour employees
db.employees.createIndex({ email: 1 }, { unique: true })
db.employees.createIndex({ isActive: 1 })

// Exemple pour bookings
db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ date: 1 })
```

### 3. Permissions Utilisateurs

**Vérifier que les utilisateurs MongoDB ont accès à `coworking_cafe_prod`** :

```
Atlas → Database Access → Modifier chaque utilisateur
→ Database User Privileges
→ Specific Privileges:
   Database: coworking_cafe_prod
   Collection: All Collections
   Privilege: readWrite
```

---

## 🧪 Tests de Validation

### Test 1 : Connexion MongoDB

```bash
# Test local
cd apps/admin
pnpm dev

# Console doit afficher :
# ✅ Connected to MongoDB
# Database: coworking_cafe_prod
```

### Test 2 : Login Admin

```
http://localhost:3001/login

Email: dev@coworkingcafe.fr
Password: Dev123456!

✅ Doit se connecter
✅ Console : "Admin found: dev@coworkingcafe.fr"
```

### Test 3 : Vérifier Collections

```bash
# Dans MongoDB Compass
# Connexion → coworking_cafe_prod

# Vérifier que les collections existent :
✅ admins (1 document minimum)
✅ employees
✅ shifts
✅ timeEntries
✅ ...
```

---

## 📊 Comparaison

| Aspect | AVANT (coworking-admin) | APRÈS (coworking_cafe_prod) |
|--------|------------------------|----------------------------|
| Nom | coworking-admin | coworking_cafe_prod |
| Structure | Ancienne | Nouvelle (3 collections) |
| Admins | Dans `users` avec rôle ObjectId | Dans `admins` avec rôle string |
| Clarté | Confusion users/admins | Séparation claire |
| Performance | 2 requêtes (user + role) | 1 requête (admin inline) |

---

## 🆘 Dépannage

### Erreur : "Database not found"

**Cause** : L'URI pointe vers une DB inexistante

**Solution** :
```bash
# Vérifier l'URI
echo $MONGODB_URI

# Doit contenir : /coworking_cafe_prod
# PAS : /coworking-admin
```

---

### Erreur : "Collection admins not found"

**Cause** : La collection `admins` n'existe pas encore

**Solution** :
```bash
# Recréer le compte admin
MONGODB_URI="mongodb+srv://...coworking_cafe_prod..." \
  node scripts/create-admin-direct.js \
  --email dev@coworkingcafe.fr \
  --password Dev123456! \
  --name Thierry \
  --role dev
```

---

### Erreur : "Authentication failed"

**Cause** : L'utilisateur MongoDB n'a pas les permissions sur `coworking_cafe_prod`

**Solution** :
```
Atlas → Database Access → Modifier admin-prod
→ Specific Privileges:
   Database: coworking_cafe_prod
   Privilege: readWrite
→ Save
```

---

## 📚 Ressources

- Architecture : `apps/admin/COLLECTIONS_ARCHITECTURE.md`
- Migration : `apps/admin/MIGRATION_ADMINS_COLLECTION.md`
- MongoDB Atlas : `docs/MONGODB_ATLAS_SETUP.md`
- Tests : `apps/admin/TEST_LOGIN.md`

---

**Dernière mise à jour** : 2026-01-30
**Status** : ✅ .env.local mis à jour, reste Vercel + Northflank
