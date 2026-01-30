# 🗄️ Architecture des Collections MongoDB

> Documentation de l'organisation des collections pour le projet Coworking Café
> Date : 2026-01-30

---

## 📊 Vue d'ensemble

Le projet utilise **3 collections distinctes** pour séparer les responsabilités :

```
┌─────────────────────────────────────────────────────────┐
│                    MongoDB Database                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  users (Site Public)                                    │
│  └── Clients et réservations                            │
│                                                         │
│  employees (RH)                                         │
│  └── Employés, planning, pointage                       │
│                                                         │
│  admins (Système) ← NOUVEAU                             │
│  └── Comptes d'accès admin/dev                          │
│      avec lien optionnel vers employees                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Collection `users` (Site Public)

### Usage
Clients du site public `apps/site`

### Structure
```javascript
{
  _id: ObjectId("..."),
  email: "client@example.com",
  password: "$2b$10$...", // bcrypt hash
  givenName: "John",
  familyName: "Doe",
  username: "johndoe",
  role: ObjectId("..."), // Référence vers roles (slug: "client")
  emailVerified: true,
  phone: "+33123456789",
  createdAt: ISODate("2026-01-15T..."),
  updatedAt: ISODate("2026-01-15T...")
}
```

### Relations
- `role` → Collection `roles` (slug: "client")
- `bookings` ← Collection `bookings` (userId)
- `orders` ← Collection `orders` (userId)

### Utilisation
- Inscription site public (`/signup`)
- Login client (`/login`)
- Réservations espaces
- Commandes café/produits

---

## 2️⃣ Collection `employees` (RH)

### Usage
Employés opérationnels pour le planning, pointage, et gestion RH

### Structure
```javascript
{
  _id: ObjectId("6971e75be588a386afdb7bd6"),
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie.dupont@coworkingcafe.fr",
  phone: "+33123456789",
  dateOfBirth: "1995-03-15",
  placeOfBirth: "Lyon",
  address: {
    street: "10 Rue de la République",
    postalCode: "69001",
    city: "Lyon"
  },
  socialSecurityNumber: "295031234567890",

  // Contrat
  contractType: "CDI",
  contractualHours: 35,
  hireDate: "2024-01-15",
  employeeRole: "Employé polyvalent",

  // Planning & Pointage
  availability: {
    monday: { available: true, timeSlots: [...] },
    // ...
  },
  clockingCode: "1234", // PIN pointage

  // Onboarding
  onboardingStatus: {
    personalInfoCompleted: true,
    contractSigned: true,
    // ...
  },

  // Admin (optionnel, ne pas utiliser pour accès admin)
  dashboardPinHash: null, // ⚠️ Déprécié, utiliser collection `admins`

  // UI
  color: "#3B82F6",
  isActive: true,
  isDraft: false,

  createdAt: ISODate("2024-01-15T..."),
  updatedAt: ISODate("2026-01-30T...")
}
```

### Relations
- `shifts` ← Collection `shifts` (employeeId)
- `timeEntries` ← Collection `timeEntries` (employeeId)
- `admins` ← Collection `admins` (employeeId) - Lien optionnel

### Utilisation
- Gestion RH (`apps/admin/hr/employees`)
- Planning hebdomadaire (`apps/admin/hr/schedule`)
- Pointage (`apps/admin/clocking`)
- Disponibilités (`apps/admin/hr/availability`)

### ⚠️ Important
**Les employés ne doivent PAS contenir de données d'authentification admin.**
→ Utiliser la collection `admins` pour l'accès système.

---

## 3️⃣ Collection `admins` (Système) ← NOUVEAU

### Usage
Comptes d'accès à l'application admin (`apps/admin`)

### Structure
```javascript
{
  _id: ObjectId("..."),
  email: "admin@coworkingcafe.fr",
  password: "$2b$10$...", // bcrypt hash
  givenName: "Big",
  role: "admin", // "dev" | "admin" | "staff" (string, pas ObjectId)

  // Lien optionnel vers employee (si l'admin est aussi employé)
  employeeId: ObjectId("6971e75be588a386afdb7bd6"),

  createdAt: ISODate("2026-01-30T..."),
  updatedAt: ISODate("2026-01-30T...")
}
```

### Rôles Disponibles

| Rôle | Valeur | Accès |
|------|--------|-------|
| Développeur | `"dev"` | Complet (debug tools) |
| Administrateur | `"admin"` | Gestion HR + Comptabilité |
| Staff | `"staff"` | Lecture planning/pointage |

### Relations
- `employeeId` → Collection `employees` (optionnel)

### Utilisation
- Authentification admin app (`/login`)
- Permissions système (RBAC)
- Lien avec employé pour double casquette

### Cas d'Usage

#### Admin pur (pas employé)
```javascript
{
  email: "dev@coworkingcafe.fr",
  password: "$2b$10$...",
  givenName: "Dev",
  role: "dev",
  employeeId: null // Pas d'employé lié
}
```
→ Accès admin sans apparaître dans le planning

#### Manager (employé + admin)
```javascript
// employees
{
  _id: ObjectId("6971e75be588a386afdb7bd6"),
  firstName: "Big",
  lastName: "Boss",
  email: "big.boss@coworkingcafe.fr",
  employeeRole: "Manager",
  // ... données RH
}

// admins
{
  email: "big.boss@coworkingcafe.fr",
  password: "$2b$10$...",
  givenName: "Big",
  role: "admin",
  employeeId: ObjectId("6971e75be588a386afdb7bd6") // Lié à l'employé
}
```
→ Apparaît dans le planning ET a accès admin

---

## 🔄 Migration Nécessaire

### Étape 1 : Créer la Collection `admins`

```javascript
// Créer un admin pour tester
db.admins.insertOne({
  email: "dev@coworkingcafe.fr",
  password: "$2b$10$hUfihuQqfQF3fI5aMIxq0usHxT776nFM3B4MQB.Ve5Dt/gj1vwVT.", // "123456"
  givenName: "Dev",
  role: "dev",
  employeeId: ObjectId("6971e75be588a386afdb7bd6"), // Lien vers employee existant
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Étape 2 : Modifier NextAuth (`auth-options.ts`)

Remplacer la recherche dans `users` par `admins` :

```typescript
// AVANT (recherche dans users)
const user = await usersCollection.findOne({ email: credentials.email });

// APRÈS (recherche dans admins)
const adminsCollection = db.collection('admins');
const admin = await adminsCollection.findOne({ email: credentials.email });

if (!admin) {
  throw new Error('Email ou mot de passe incorrect');
}

// Vérifier le rôle (maintenant en string direct)
if (!['dev', 'admin', 'staff'].includes(admin.role)) {
  throw new Error('Accès non autorisé');
}

return {
  id: admin._id.toString(),
  email: admin.email,
  name: admin.givenName,
  role: admin.role, // "dev", "admin", ou "staff"
};
```

### Étape 3 : Nettoyer `employees`

Supprimer les champs admin dans `employees` :

```javascript
// Supprimer dashboardPinHash de tous les employés
db.employees.updateMany(
  {},
  {
    $unset: { dashboardPinHash: "" }
  }
)
```

### Étape 4 : Tester

```bash
# 1. Créer un admin via script
MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js

# 2. Tester login admin app
# → https://admin.coworkingcafe.fr/login

# 3. Vérifier que l'employé lié apparaît toujours dans le planning
```

---

## 🛠️ Scripts Disponibles

### Créer un Admin
```bash
MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js
```

**Fonctionnalités** :
- Crée un compte dans `admins`
- Hash bcrypt automatique
- Détection automatique d'employé avec le même email
- Propose de lier le compte admin à l'employé

---

## 📋 Checklist de Migration

Pour migrer l'authentification vers `admins` :

- [ ] Créer la collection `admins` dans MongoDB
- [ ] Créer au moins un compte admin de test (via script)
- [ ] Modifier `apps/admin/src/lib/auth-options.ts` :
  - [ ] Remplacer `users` par `admins` dans les requêtes
  - [ ] Adapter la structure (role en string direct)
  - [ ] Tester login avec le compte de test
- [ ] Nettoyer `employees` :
  - [ ] Supprimer `dashboardPinHash` de tous les employés
  - [ ] Documenter que l'accès admin se fait via `admins`
- [ ] Mettre à jour la documentation :
  - [ ] `SECURITY.md`
  - [ ] `PWA_AUTH.md`
  - [ ] `CLAUDE.md`
- [ ] Tester les cas d'usage :
  - [ ] Admin pur (pas employé) → Pas dans planning ✓
  - [ ] Manager (employé + admin) → Dans planning + accès admin ✓
  - [ ] Employé normal → Pas d'accès admin ✓

---

## 🔍 Exemples de Requêtes

### Trouver tous les admins
```javascript
db.admins.find()
```

### Trouver les admins liés à un employé
```javascript
db.admins.find({ employeeId: { $ne: null } })
```

### Lier un admin existant à un employé
```javascript
db.admins.updateOne(
  { email: "admin@example.com" },
  {
    $set: {
      employeeId: ObjectId("6971e75be588a386afdb7bd6"),
      updatedAt: new Date()
    }
  }
)
```

### Trouver l'admin lié à un employé spécifique
```javascript
db.admins.findOne({ employeeId: ObjectId("6971e75be588a386afdb7bd6") })
```

---

## ⚠️ Points d'Attention

### 1. Double Email
Si un Manager a le même email dans `employees` et `admins` :
- ✅ **C'est OK** - C'est le cas d'usage attendu pour double casquette
- Le login admin utilisera `admins.password`
- Le pointage utilisera `employees.clockingCode`

### 2. Synchronisation
Si un employé change d'email :
- ⚠️ **Mettre à jour manuellement** dans `admins` si lié
- Ou utiliser un script de synchronisation

### 3. Suppression
Si un employé est désactivé (`isActive: false`) :
- ⚠️ Son compte admin reste actif dans `admins`
- Décision : désactiver manuellement dans `admins` si nécessaire

---

**Dernière mise à jour** : 2026-01-30
