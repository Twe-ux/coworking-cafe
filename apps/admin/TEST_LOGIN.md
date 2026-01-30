# 🧪 Test du Nouveau Système d'Authentification

> Test de la migration vers la collection `admins`
> Date : 2026-01-30

---

## ✅ Compte Dev Créé

Votre compte admin dev a été créé avec succès :

```
📧 Email    : dev@coworkingcafe.fr
🔑 Password : Dev123456!
🎭 Rôle     : dev (accès complet)
🗄️ Collection: admins
🆔 ID       : 697c8d26af43736f983c32ac
```

---

## 🧪 Tests à Effectuer

### Test 1 : Login Local (5 min)

```bash
# 1. Lancer l'app admin en dev
cd apps/admin
pnpm dev

# 2. Ouvrir dans le navigateur
# → http://localhost:3000/login

# 3. Se connecter avec :
Email: dev@coworkingcafe.fr
Password: Dev123456!

# 4. Vérifier dans la console navigateur (F12)
✅ Logs attendus :
   📡 Password authentication with email: dev@coworkingcafe.fr
   🔍 Looking for admin: dev@coworkingcafe.fr
   ✅ Admin found: dev@coworkingcafe.fr
   🔐 Password comparison result: true
   ✅ Password valid
   👤 Admin role: dev
   ✅ Role valid: dev

# 5. Vous devez être redirigé vers /admin ou /(dashboard)
```

**Résultat attendu** :
- ✅ Login réussi
- ✅ Redirection vers dashboard
- ✅ Session active
- ✅ Rôle "dev" affiché

---

### Test 2 : Vérifier la Session (2 min)

Une fois connecté, ouvrir la console navigateur (F12) :

```javascript
// Tester l'API de session
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

**Résultat attendu** :
```json
{
  "user": {
    "email": "dev@coworkingcafe.fr",
    "name": "Thierry",
    "role": "dev",
    "id": "697c8d26af43736f983c32ac"
  },
  "expires": "2026-02-29T..."
}
```

---

### Test 3 : Test Email/Password Incorrects (2 min)

```
# Test 1 : Email invalide
Email: wrong@example.com
Password: Dev123456!
→ Doit afficher : "Email ou mot de passe incorrect"

# Test 2 : Password incorrect
Email: dev@coworkingcafe.fr
Password: WrongPassword123
→ Doit afficher : "Email ou mot de passe incorrect"
```

**Résultat attendu** :
- ❌ Login refusé
- ❌ Message d'erreur clair
- ❌ Pas de redirection

---

### Test 4 : Accès Routes Protégées (3 min)

Une fois connecté :

```
# Tester l'accès aux différentes sections
✅ /admin → Dashboard
✅ /hr/employees → Liste employés
✅ /accounting/cash-control → Caisse
✅ /admin/debug/notifications → Debug tools (dev only)
```

**Résultat attendu** :
- ✅ Toutes les pages accessibles avec rôle "dev"
- ✅ Pas d'erreurs 401 ou 403

---

### Test 5 : Logout (1 min)

```
# Cliquer sur le bouton de déconnexion
→ Doit vous déconnecter et rediriger vers /login
```

**Résultat attendu** :
- ✅ Déconnexion réussie
- ✅ Redirection vers /login
- ✅ Impossible d'accéder aux routes protégées après logout

---

## 🐛 Dépannage

### Erreur : "Admin not found"

**Cause** : L'email n'existe pas dans la collection `admins`

**Solution** :
```bash
# Vérifier dans MongoDB Compass
db.admins.findOne({ email: "dev@coworkingcafe.fr" })

# Si null, recréer le compte
MONGODB_URI="..." node scripts/create-admin-direct.js \
  --email dev@coworkingcafe.fr \
  --password Dev123456! \
  --name Thierry \
  --role dev
```

---

### Erreur : "Invalid password"

**Cause** : Le mot de passe ne correspond pas au hash

**Solution** :
```bash
# Réinitialiser le mot de passe
# 1. Générer nouveau hash
node scripts/hash-password.js "NouveauPassword123"

# 2. Mettre à jour dans MongoDB Compass
db.admins.updateOne(
  { email: "dev@coworkingcafe.fr" },
  { $set: {
      password: "$2b$10$...", // Hash du script
      updatedAt: new Date()
    }
  }
)
```

---

### Erreur : "Cannot connect to MongoDB"

**Cause** : URI MongoDB incorrecte ou réseau

**Solution** :
```bash
# Vérifier la variable d'environnement
echo $MONGODB_URI

# Vérifier dans .env.local (apps/admin)
cat apps/admin/.env.local

# Doit contenir :
MONGODB_URI=mongodb+srv://admin-prod:PASSWORD@cluster...
```

---

## ✅ Checklist de Validation

Après avoir effectué tous les tests :

- [ ] Login avec email/password réussit
- [ ] Session NextAuth active
- [ ] Rôle "dev" correctement assigné
- [ ] Accès à toutes les routes protégées
- [ ] Logout fonctionne
- [ ] Email/password incorrects refusés
- [ ] Console sans erreurs critiques

---

## 📊 Comparaison Avant/Après

### AVANT (collection `users`)
```javascript
// Recherche dans users avec rôle ObjectId
db.users.findOne({ email: "..." })
// + lookup dans roles collection
db.roles.findOne({ _id: user.role })
// = 2 requêtes DB
```

### APRÈS (collection `admins`)
```javascript
// Recherche directe dans admins avec rôle string
db.admins.findOne({ email: "..." })
// Rôle inline : admin.role = "dev"
// = 1 requête DB (plus rapide !)
```

---

## 🚀 Prochaines Étapes

### 1. Si Tests OK → Deploy en Production

```bash
# 1. Push les changements
git push origin main

# 2. Vercel déploie automatiquement
# 3. Créer le compte dev en production
MONGODB_URI="mongodb+srv://admin-prod:..." \
  node scripts/create-admin-direct.js \
  --email dev@coworkingcafe.fr \
  --password VotrePasswordSecurise123! \
  --name Thierry \
  --role dev

# 4. Tester sur https://admin.coworkingcafe.fr/login
```

---

### 2. Créer Comptes Admin Additionnels

```bash
# Compte admin pour une autre personne
MONGODB_URI="..." node scripts/create-admin-direct.js \
  --email marie@coworkingcafe.fr \
  --password MotDePasseMarie123! \
  --name Marie \
  --role admin

# Si Marie est aussi employée, ajouter --link-employee true
```

---

### 3. Nettoyer `employees` Collection (Optionnel)

Si des employés ont encore `dashboardPinHash` :

```javascript
// MongoDB Compass ou mongosh
db.employees.updateMany(
  {},
  {
    $unset: { dashboardPinHash: "" },
    $set: { updatedAt: new Date() }
  }
)

// Vérifier que c'est bien supprimé
db.employees.findOne({ dashboardPinHash: { $exists: true } })
// Doit retourner null
```

---

## 📚 Documentation Complète

- Architecture : `apps/admin/COLLECTIONS_ARCHITECTURE.md`
- Migration : `apps/admin/MIGRATION_ADMINS_COLLECTION.md`
- Sécurité : `apps/admin/SECURITY.md`
- MongoDB Atlas : `docs/MONGODB_ATLAS_SETUP.md`

---

**Dernière mise à jour** : 2026-01-30
**Status** : ✅ Compte dev créé, prêt pour tests
**Commit** : `6e3214d`
