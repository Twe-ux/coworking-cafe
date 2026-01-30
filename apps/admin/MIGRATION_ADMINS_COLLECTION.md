# 🔄 Guide de Migration : Collection `admins`

> Migration de l'authentification admin de `users` vers `admins`
> Date : 2026-01-30

---

## 🎯 Objectif

Migrer l'authentification de l'admin app pour utiliser la nouvelle collection `admins` au lieu de `users`.

**Pourquoi ?**
- ✅ Séparation claire : `users` (clients site) vs `admins` (comptes système)
- ✅ Nom explicite sans ambiguïté
- ✅ Support double casquette (employé + admin) via `employeeId`
- ✅ Filtrage simplifié dans le code

---

## 📋 Checklist de Migration

### Phase 1 : Préparation MongoDB (5 min)

- [ ] **1.1 - Créer un admin de test**
  ```bash
  MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js
  ```

  Renseigner :
  - Email : `dev@coworkingcafe.fr` (ou votre email)
  - Mot de passe : `123456` (pour test)
  - Prénom : `Dev`
  - Rôle : `dev`
  - Lier à employé : `y` (si employé existe avec cet email)

- [ ] **1.2 - Vérifier dans MongoDB Compass**
  ```javascript
  db.admins.findOne({ email: "dev@coworkingcafe.fr" })
  ```

  Doit retourner :
  ```javascript
  {
    _id: ObjectId("..."),
    email: "dev@coworkingcafe.fr",
    password: "$2b$10$...",
    givenName: "Dev",
    role: "dev",
    employeeId: ObjectId("...") ou null,
    createdAt: ISODate("..."),
    updatedAt: ISODate("...")
  }
  ```

### Phase 2 : Modification du Code (15 min)

- [ ] **2.1 - Modifier `auth-options.ts`**

Fichier : `apps/admin/src/lib/auth-options.ts`

**Changement 1** : Remplacer la collection `users` par `admins`

```typescript
// AVANT (ligne ~153)
const { db } = await connectToDatabase();
const usersCollection = db.collection<UserDocument>('users');
const rolesCollection = db.collection<RoleDocument>('roles');

// APRÈS
const { db } = await connectToDatabase();
const adminsCollection = db.collection('admins');
// Plus besoin de rolesCollection car le rôle est en string direct
```

**Changement 2** : Adapter la recherche de l'admin

```typescript
// AVANT (ligne ~159)
const user = await usersCollection.findOne({ email: credentials.email });

if (!user) {
  console.log('❌ User not found');
  throw new Error('Email ou mot de passe incorrect');
}

// APRÈS
const admin = await adminsCollection.findOne({
  email: credentials.email.toLowerCase()
});

if (!admin) {
  console.log('❌ Admin not found');
  throw new Error('Email ou mot de passe incorrect');
}
```

**Changement 3** : Vérifier le mot de passe

```typescript
// AVANT (ligne ~168)
const isPasswordValid = await bcrypt.compare(
  credentials.password,
  user.password
);

// APRÈS (identique, juste changer la variable)
const isPasswordValid = await bcrypt.compare(
  credentials.password,
  admin.password
);
```

**Changement 4** : Supprimer la recherche de rôle (maintenant en string direct)

```typescript
// AVANT (lignes ~182-194)
// Populate role
const role = await rolesCollection.findOne({ _id: user.role });
if (!role) {
  console.log('❌ Role not found for user');
  throw new Error('Rôle utilisateur invalide');
}

console.log('👤 User role found:', role.slug);

// Check if user has valid admin role
if (!['dev', 'admin', 'staff', 'client'].includes(role.slug)) {
  console.log('❌ Invalid role:', role.slug);
  throw new Error('Accès non autorisé');
}

// APRÈS (simplifié)
console.log('👤 Admin role:', admin.role);

// Check if admin has valid role (string direct)
if (!['dev', 'admin', 'staff'].includes(admin.role)) {
  console.log('❌ Invalid role:', admin.role);
  throw new Error('Accès non autorisé');
}
```

**Changement 5** : Retourner l'objet utilisateur

```typescript
// AVANT (ligne ~200)
return {
  id: user._id.toString(),
  email: user.email,
  name: user.givenName || user.username || user.email.split('@')[0],
  role: role.slug,
} as NextAuthUser;

// APRÈS
return {
  id: admin._id.toString(),
  email: admin.email,
  name: admin.givenName || admin.email.split('@')[0],
  role: admin.role, // String direct : "dev", "admin", ou "staff"
} as NextAuthUser;
```

**Code complet modifié** :

```typescript
// ===== AUTHENTIFICATION EMAIL + PASSWORD (admin app) =====
if (!credentials.email) {
  console.log('❌ Email requis pour authentification par password');
  throw new Error('Email et mot de passe requis');
}

console.log('📡 Password authentication with email:', credentials.email);
const { db } = await connectToDatabase();

console.log('🔍 Looking for admin:', credentials.email);
const adminsCollection = db.collection('admins');

const admin = await adminsCollection.findOne({
  email: credentials.email.toLowerCase()
});

if (!admin) {
  console.log('❌ Admin not found');
  throw new Error('Email ou mot de passe incorrect');
}

console.log('✅ Admin found:', admin.email);

const isPasswordValid = await bcrypt.compare(
  credentials.password,
  admin.password
);

console.log('🔐 Password comparison result:', isPasswordValid);

if (!isPasswordValid) {
  console.log('❌ Invalid password');
  throw new Error('Email ou mot de passe incorrect');
}

console.log('✅ Password valid');

// Vérifier le rôle (string direct)
console.log('👤 Admin role:', admin.role);

if (!['dev', 'admin', 'staff'].includes(admin.role)) {
  console.log('❌ Invalid role:', admin.role);
  throw new Error('Accès non autorisé');
}

console.log('✅ Role valid:', admin.role);

// Retourner l'objet utilisateur avec les champs requis par NextAuth
return {
  id: admin._id.toString(),
  email: admin.email,
  name: admin.givenName || admin.email.split('@')[0],
  role: admin.role,
} as NextAuthUser;
```

- [ ] **2.2 - Mettre à jour les types TypeScript**

Fichier : `apps/admin/src/lib/auth-options.ts`

```typescript
// AVANT (ligne ~13)
interface UserDocument {
  _id: ObjectId;
  email: string;
  password: string;
  givenName?: string;
  username?: string;
  role: ObjectId; // ObjectId référence vers roles
}

interface RoleDocument {
  _id: ObjectId;
  slug: string;
  name: string;
}

// APRÈS (simplifié)
interface AdminDocument {
  _id: ObjectId;
  email: string;
  password: string;
  givenName?: string;
  role: 'dev' | 'admin' | 'staff'; // String direct
  employeeId?: ObjectId | null;
}

// Plus besoin de RoleDocument
```

### Phase 3 : Tests (10 min)

- [ ] **3.1 - Tester login admin**
  ```bash
  cd apps/admin
  pnpm dev
  ```

  Ouvrir : http://localhost:3000/login

  Tester avec :
  - Email : `dev@coworkingcafe.fr`
  - Password : `123456`

  ✅ Doit réussir et rediriger vers `/admin` ou `/(dashboard)`

- [ ] **3.2 - Vérifier la console**
  Logs attendus :
  ```
  📡 Password authentication with email: dev@coworkingcafe.fr
  🔍 Looking for admin: dev@coworkingcafe.fr
  ✅ Admin found: dev@coworkingcafe.fr
  🔐 Password comparison result: true
  ✅ Password valid
  👤 Admin role: dev
  ✅ Role valid: dev
  ```

- [ ] **3.3 - Vérifier la session NextAuth**
  Ouvrir la console navigateur (F12) :
  ```javascript
  // Dans l'onglet Console
  fetch('/api/auth/session').then(r => r.json()).then(console.log)
  ```

  Doit retourner :
  ```javascript
  {
    user: {
      email: "dev@coworkingcafe.fr",
      name: "Dev",
      role: "dev",
      id: "..."
    },
    expires: "..."
  }
  ```

- [ ] **3.4 - Tester email invalide**
  Login avec email inexistant → Doit afficher erreur

- [ ] **3.5 - Tester password incorrect**
  Login avec mauvais password → Doit afficher erreur

- [ ] **3.6 - Tester accès routes protégées**
  ```bash
  # Aller sur une page admin (HR, Compta)
  # → Doit fonctionner normalement
  ```

### Phase 4 : Nettoyage (5 min)

- [ ] **4.1 - Supprimer `dashboardPinHash` des employés**
  ```javascript
  // Dans MongoDB Compass ou mongosh
  db.employees.updateMany(
    {},
    {
      $unset: { dashboardPinHash: "" },
      $set: { updatedAt: new Date() }
    }
  )
  ```

- [ ] **4.2 - Vérifier que les employés n'ont plus ce champ**
  ```javascript
  db.employees.findOne({ dashboardPinHash: { $exists: true } })
  // Doit retourner null
  ```

### Phase 5 : Documentation (5 min)

- [ ] **5.1 - Mettre à jour `SECURITY.md`**
  Remplacer les références à `users` par `admins`

- [ ] **5.2 - Mettre à jour `PWA_AUTH.md`**
  Clarifier que l'authentification utilise `admins`

- [ ] **5.3 - Mettre à jour `CLAUDE.md`**
  Section "Migration" : Documenter la nouvelle architecture

### Phase 6 : Commit & Deploy (5 min)

- [ ] **6.1 - Commit des changements**
  ```bash
  git add apps/admin/src/lib/auth-options.ts
  git commit -m "feat(admin): migrate authentication to 'admins' collection

  - Use dedicated 'admins' collection instead of 'users'
  - Simplify role system (string direct instead of ObjectId)
  - Support employeeId link for dual role (employee + admin)
  - Clean up employees collection (remove dashboardPinHash)

  Breaking change: Requires admins to be created via scripts/create-admin.js

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```

- [ ] **6.2 - Push vers GitHub**
  ```bash
  git push origin main
  ```

- [ ] **6.3 - Deploy sur Vercel**
  Vercel va automatiquement redéployer

- [ ] **6.4 - Créer les admins en production**
  ```bash
  # Avec la MongoDB URI de production
  MONGODB_URI="mongodb+srv://PROD..." node scripts/create-admin.js
  ```

---

## ⚠️ Points d'Attention

### Authentification PIN Employé (Pointage)

**Important** : La partie "Employee PIN authentication" (lignes 48-100) utilise toujours la collection `employees` avec `dashboardPinHash`.

**Décision à prendre** :
1. **Garder `dashboardPinHash` dans `employees`** pour le pointage uniquement
2. **Ou** créer un nouveau champ séparé comme `clockingPinHash`

**Recommandation** : Renommer `dashboardPinHash` → `clockingPinHash` pour clarifier l'usage.

```javascript
// Modifier dans auth-options.ts (ligne ~66)
// AVANT
if (emp.dashboardPinHash) {
  const isPinValid = await bcrypt.compare(credentials.password, emp.dashboardPinHash);
}

// APRÈS
if (emp.clockingPinHash) {
  const isPinValid = await bcrypt.compare(credentials.password, emp.clockingPinHash);
}
```

### PIN PWA Admin

Le système PIN PWA (localStorage) continue de fonctionner car il est lié à la **session NextAuth**, pas directement à la collection.

**Aucun changement nécessaire** dans :
- `PINAuthContext.tsx`
- `PINSetup.tsx`
- `PINLogin.tsx`

---

## 🧪 Tests de Régression

Après la migration, vérifier que ces fonctionnalités marchent toujours :

- [ ] Login admin avec email + password
- [ ] Login PWA avec PIN (après premier login)
- [ ] Pointage employé avec PIN 6 chiffres
- [ ] Accès routes protégées (HR, Compta)
- [ ] Restriction IP pour staff routes
- [ ] Logout admin

---

## 🆘 Rollback en Cas de Problème

Si la migration pose problème :

```bash
# 1. Revenir au commit précédent
git revert HEAD

# 2. Push
git push origin main

# 3. Vercel redéploie automatiquement l'ancienne version
```

---

## 📊 Résultat Attendu

Après migration :

```
✅ Collection `admins` utilisée pour authentification
✅ Rôle en string direct (plus simple)
✅ Support employeeId pour double casquette
✅ employees nettoyé (pas de dashboardPinHash)
✅ Séparation claire : users (clients) / employees (RH) / admins (système)
```

---

## 📚 Ressources

- Architecture complète : `apps/admin/COLLECTIONS_ARCHITECTURE.md`
- Sécurité : `apps/admin/SECURITY.md`
- Script création admin : `scripts/create-admin.js`

---

**Temps total estimé** : 45 minutes

**Dernière mise à jour** : 2026-01-30
