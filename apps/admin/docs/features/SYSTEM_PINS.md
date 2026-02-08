# Système de Codes PIN - CoworKing Café Admin

## 📋 Vue d'ensemble

Le système sépare complètement l'authentification des **Employés** et des **Clients** :

### Employés (Employee collection)
- **PIN Pointage** : 4 chiffres (tous les employés)
- **PIN Dashboard** : 6 chiffres (Manager et Assistant Manager uniquement)
- **Authentification** : PIN uniquement (pas d'email requis)
- **Stockage** : `dashboardPinHash` dans la collection Employee

### Clients Site (User collection)
- **Email + Password** : Authentification classique
- **Stockage** : `password` dans la collection User
- **Séparation** : Les employés ne créent PAS de User, uniquement Employee

---

## 🎯 Attribution Automatique des Rôles

### Logique d'attribution selon employeeRole :

| Employee Role | System Role | PIN Pointage | PIN Dashboard | Accès Dashboard Admin |
|--------------|-------------|--------------|---------------|----------------------|
| **Employé polyvalent** | `staff` | ✅ 4 chiffres | ❌ Non requis | ❌ Non |
| **Assistant manager** | `admin` | ✅ 4 chiffres | ✅ 6 chiffres | ✅ Oui |
| **Manager** | `admin` | ✅ 4 chiffres | ✅ 6 chiffres | ✅ Oui |

### Authentification selon le rôle :

#### Employé polyvalent (staff)
- **Pointage** : PIN 4 chiffres via `/clocking` (public, vérification via `/api/hr/employees/verify-pin`)
- **Dashboard Admin** : ❌ Pas d'accès
- **User.password** : Hash du PIN pointage (4 chiffres)

#### Manager / Assistant Manager (admin)
- **Pointage** : PIN 4 chiffres via `/clocking`
- **Dashboard Admin** : PIN 6 chiffres via `/login`
- **User.password** : Hash du PIN dashboard (6 chiffres)

---

## 🔐 Modes d'Authentification

Le système supporte **3 modes d'authentification** selon le type d'utilisateur :

### Mode 1 : PIN uniquement (Employés Dashboard)

**Utilisé par** : Manager, Assistant Manager

**Formulaire** :
- Champ : PIN (6 chiffres)
- Email : NON requis

**Logique** :
1. Détection : `password` est 6 chiffres ET `email` est vide
2. Recherche dans `Employee` collection
3. Comparaison avec `dashboardPinHash`
4. Rôle système déterminé par `employeeRole` :
   - Manager → `admin`
   - Assistant manager → `admin`
   - Employé polyvalent → `staff` (pas d'accès dashboard)

**Exemple** :
```javascript
// Login form
{
  email: "",           // Vide
  password: "111111"   // PIN 6 chiffres
}

// Résultat : Authentifié comme Admin Dev
```

---

### Mode 2 : Email + PIN (Ancienne logique User)

**Utilisé par** : Comptes User créés avant migration (compatibilité)

**Formulaire** :
- Champ : Email + PIN (6 chiffres)

**Logique** :
1. Détection : `password` est 6 chiffres ET `email` fourni
2. Recherche dans `User` collection par email
3. Comparaison avec `password` (hash bcrypt)
4. Rôle depuis `User.role` (dev/admin/staff/client)

---

### Mode 3 : Email + Password (Clients Site)

**Utilisé par** : Clients du site public

**Formulaire** :
- Champ : Email + Password (pas un PIN)

**Logique** :
1. Détection : `password` n'est PAS 6 chiffres ET `email` fourni
2. Recherche dans `User` collection par email
3. Comparaison avec `password` (hash bcrypt)
4. Rôle depuis `User.role` (généralement `client`)

---

## 🔧 API Endpoints

### 1. Créer un employé (SANS User)

**Endpoint** : `POST /api/hr/employees/create-with-account`

**Permissions** : `dev`, `admin` uniquement

**⚠️ NOTE** : Cet endpoint ne crée PLUS de User, uniquement Employee

#### Exemple 1: Employé polyvalent (staff)

```json
{
  "firstName": "Jean",
  "lastName": "Martin",
  "email": "jean.martin@coworkingcafe.fr",
  "phone": "+33123456789",
  "employeeRole": "Employé polyvalent",
  "clockingCode": "1234",
  "dateOfBirth": "1995-03-15",
  "hireDate": "2026-02-01",
  "contractType": "CDI",
  "contractualHours": 35
}
```

**Résultat** :
- ✅ Employee créé avec `clockingCode: "1234"`
- ❌ PAS de User créé (séparation Employee/User)
- ❌ Pas de PIN dashboard (non requis)
- ❌ Pas d'accès dashboard admin

#### Exemple 2: Manager (admin)

```json
{
  "firstName": "Marie",
  "lastName": "Dupont",
  "email": "marie.dupont@coworkingcafe.fr",
  "phone": "+33123456789",
  "employeeRole": "Manager",
  "clockingCode": "5678",
  "dashboardPin": "123456",
  "dateOfBirth": "1988-07-20",
  "hireDate": "2026-02-01",
  "contractType": "CDI",
  "contractualHours": 35
}
```

**Résultat** :
- ✅ Employee créé avec `clockingCode: "5678"`, `dashboardPinHash: hash("123456")`
- ❌ PAS de User créé (séparation Employee/User)
- ✅ Accès dashboard admin avec PIN uniquement (pas d'email)

**Validations** :
- `clockingCode` : Exactement 4 chiffres
- `dashboardPin` : Exactement 6 chiffres (requis pour Manager/Assistant Manager)
- Les deux PINs doivent être différents

---

### 2. Modifier les PINs d'un employé

**Endpoint** : `PUT /api/hr/employees/[id]/update-system-role`

**Permissions** : `dev`, `admin` uniquement

**⚠️ NOTE** : Cet endpoint ne modifie PLUS le User, uniquement Employee

#### Exemple 1: Changer PIN pointage (staff)

```json
{
  "clockingCode": "4321"
}
```

**Résultat** :
- ✅ `employee.clockingCode` mis à jour
- ❌ PAS de modification User (séparation)

#### Exemple 2: Changer PIN dashboard (admin)

```json
{
  "dashboardPin": "654321"
}
```

**Résultat** :
- ✅ `employee.dashboardPinHash` mis à jour avec hash("654321")
- ℹ️ `clockingCode` inchangé
- ❌ PAS de modification User

#### Exemple 3: Changer les deux PINs

```json
{
  "clockingCode": "9876",
  "dashboardPin": "456789"
}
```

**Résultat** :
- ✅ `employee.clockingCode` mis à jour
- ✅ `employee.dashboardPinHash` mis à jour avec hash("456789")
- ❌ PAS de modification User

**Validations** :
- `clockingCode` : Exactement 4 chiffres
- `dashboardPin` : Exactement 6 chiffres
- Les deux PINs doivent être différents
- `dashboardPin` n'est pas applicable pour un Employé polyvalent

---

## 🔐 Sécurité

### Hashing des PINs
- Tous les PINs sont hashés avec bcrypt (10 rounds)
- Jamais stockés en clair dans la base de données
- Comparaison via `bcrypt.compare(pin, hashedPassword)`

### Validation
- **PIN Pointage** : Strictement 4 chiffres (`/^\d{4}$/`)
- **PIN Dashboard** : Strictement 6 chiffres (`/^\d{6}$/`)
- Unicité du PIN pointage garantie (index unique sur `Employee.clockingCode`)
- Les deux PINs doivent être différents

### Accès aux routes
- **Route staff (`/clocking`)** : Bloquée par IP locale uniquement (voir `ALLOWED_STAFF_IPS`)
- **Route admin** : Protégée par NextAuth avec vérification du rôle système

---

## 🚀 Workflow Complet

### Scénario 1: Embauche Employé Polyvalent

1. **Admin crée l'employé** via dashboard
   - Choisit `employeeRole: "Employé polyvalent"`
   - Définit PIN pointage : `1234`
   - ❌ Pas de PIN dashboard

2. **Système crée automatiquement** :
   - Employee avec `clockingCode: "1234"`
   - ❌ PAS de User (séparation Employee/User)

3. **Employé pointe** :
   - Va sur `/clocking` (poste fixe uniquement)
   - Entre son PIN : `1234`
   - Système vérifie via `/api/hr/employees/verify-pin`
   - ✅ Pointage enregistré

4. **Employé n'a PAS accès** au dashboard admin (pas de dashboardPinHash)

---

### Scénario 2: Embauche Manager

1. **Admin crée l'employé** via dashboard
   - Choisit `employeeRole: "Manager"`
   - Définit PIN pointage : `5678`
   - Définit PIN dashboard : `123456`

2. **Système crée automatiquement** :
   - Employee avec `clockingCode: "5678"`, `dashboardPinHash: hash("123456")`
   - ❌ PAS de User (séparation Employee/User)

3. **Manager pointe** :
   - Va sur `/clocking` (poste fixe uniquement)
   - Entre son PIN pointage : `5678`
   - ✅ Pointage enregistré

4. **Manager accède au dashboard** :
   - Va sur `/login`
   - Entre UNIQUEMENT le PIN dashboard : `123456` (pas d'email)
   - Système cherche dans Employee collection
   - Compare avec `dashboardPinHash`
   - Détermine rôle `admin` depuis `employeeRole: "Manager"`
   - ✅ Connexion réussie
   - Accès complet au dashboard admin

---

### Scénario 3: Promotion Employé → Manager

1. **Admin modifie l'employé** via dashboard
   - Change `employeeRole` de "Employé polyvalent" à "Manager"
   - Définit nouveau PIN dashboard : `789012`

2. **Système met à jour automatiquement** :
   - `employee.employeeRole` passe de "Employé polyvalent" à "Manager"
   - `employee.dashboardPinHash` créé avec hash("789012")
   - `employee.clockingCode` inchangé (toujours `1234`)
   - ❌ PAS de création/modification User

3. **Ex-employé devient Manager** :
   - Pointe toujours avec PIN pointage : `1234`
   - Peut maintenant se connecter au dashboard avec PIN uniquement : `789012`
   - Système détermine automatiquement rôle `admin` depuis `employeeRole: "Manager"`

---

## 📊 Base de Données

### User Collection (Clients Site UNIQUEMENT)

```javascript
{
  _id: ObjectId("..."),
  email: "client@example.fr",
  password: "$2b$10$...", // Hash du password
  username: "client",
  givenName: "Jean",
  role: ObjectId("..."), // Référence au Role (généralement "client")
  phone: "+33123456789",
  newsletter: false
}
```

**⚠️ IMPORTANT** : Les employés ne créent PLUS de User. Séparation totale.

### Employee Collection (Employés Dashboard)

```javascript
{
  _id: ObjectId("..."),
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie.dupont@coworkingcafe.fr",
  employeeRole: "Manager", // Rôle métier (détermine l'accès)
  clockingCode: "5678", // PIN pointage (4 chiffres)
  dashboardPinHash: "$2b$10$...", // Hash du PIN dashboard (6 chiffres) - uniquement Manager/Assistant
  color: "#3B82F6", // Couleur planning
  // ... autres champs HR (date de naissance, contrat, etc.)
}
```

**Mappage employeeRole → Rôle système** :
- `"Manager"` → `admin` (accès dashboard complet)
- `"Assistant manager"` → `admin` (accès dashboard complet)
- `"Employé polyvalent"` → `staff` (lecture uniquement, pas d'accès dashboard)

### Role Collection (User UNIQUEMENT, pas Employee)

```javascript
{
  _id: ObjectId("..."),
  slug: "client", // généralement "client" pour les utilisateurs du site
  name: "Client",
  level: 1
}
```

**⚠️ NOTE** : Les employés ne référencent PLUS la collection Role. Leur rôle système est déterminé directement depuis `employeeRole`.

---

## ⚠️ Points d'attention

### Séparation Employee / User

**CRITIQUE** : Les employés et les clients sont maintenant complètement séparés :
- **Employee** : Personnel du café (stocke `dashboardPinHash` pour Manager/Assistant)
- **User** : Clients du site (stocke `password` classique)
- ❌ Un employé ne crée PAS de User
- ❌ Un client ne crée PAS d'Employee

### Changement de rôle métier

Quand on change `employeeRole` d'un employé :
- Le rôle système d'authentification change automatiquement (admin/staff)
- ⚠️ Si passage de Manager → Employé polyvalent, l'employé **perd l'accès dashboard**
- ⚠️ Son `dashboardPinHash` devient obsolète
- ✅ Il peut toujours pointer avec son `clockingCode`

### Sécurité des PINs

- Les PINs à 4 chiffres sont **moins sécurisés** que des mots de passe classiques
- ✅ Acceptable pour le pointage (usage interne, IP locale)
- ⚠️ Les PINs à 6 chiffres pour le dashboard sont un compromis praticité/sécurité
- 💡 Recommandation : Activer 2FA pour les comptes admin en production

### Migration de données

Si des employés existent déjà avec des comptes User (ancien système) :
1. **Option A** : Laisser les User existants (compatibilité Mode 2)
   - Les employés peuvent toujours se connecter avec email + PIN
   - Créer progressivement les `dashboardPinHash` dans Employee
2. **Option B** : Migration complète (recommandée)
   - Supprimer les User des employés
   - Créer les `dashboardPinHash` dans Employee
   - Les employés se connectent ensuite avec PIN uniquement

**Script de migration disponible** : `/apps/admin/scripts/seed-admin-users.ts`

---

## 🔧 Configuration

### Variables d'environnement

```bash
# .env.local (apps/admin)

# IPs autorisées pour la route staff (pointage)
ALLOWED_STAFF_IPS=192.168.1.100,10.0.0.50

# MongoDB
MONGODB_URI=mongodb://localhost:27017/coworking-cafe

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
```

---

## 📚 Références

- **Authentification** : `/apps/admin/src/lib/auth-options.ts`
- **Création employé** : `/apps/admin/src/app/api/hr/employees/create-with-account/route.ts`
- **Modification PINs** : `/apps/admin/src/app/api/hr/employees/[id]/update-system-role/route.ts`
- **Vérification PIN pointage** : `/apps/admin/src/app/api/hr/employees/verify-pin/route.ts`
- **Sécurité route staff** : `/apps/admin/src/app/(staff)/layout.tsx`

---

_Dernière mise à jour : 2026-01-22_
