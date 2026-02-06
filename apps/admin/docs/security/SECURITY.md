# 🔒 Guide de Sécurité - Admin App

> Documentation complète de la sécurité de l'application admin (PWA + Web)
> Date : 2026-01-30

---

## 📋 Vue d'ensemble

L'application admin utilise **plusieurs couches de sécurité** pour protéger l'accès aux données sensibles :

1. **Authentification NextAuth** - Vérification identité
2. **Contrôle d'accès basé sur les rôles (RBAC)** - Permissions granulaires
3. **Restriction IP pour staff** - Accès limité aux locaux
4. **PIN PWA** - Accès rapide sécurisé
5. **Protection API** - Toutes les routes protégées

---

## 🚫 Ce qui est IMPOSSIBLE

### ❌ Créer un Compte depuis l'Application

**IMPORTANT** : Il n'y a **AUCUNE** page de création de compte dans l'application admin.

```
❌ Pas de /signup
❌ Pas de /register
❌ Pas de formulaire d'inscription
❌ Impossible de créer un compte via PWA
❌ Impossible de créer un compte via web
```

**Seules les connexions** avec un compte existant en BD sont autorisées.

### Vérification dans le Code

```typescript
// apps/admin/src/lib/auth-options.ts (ligne 159)
const user = await usersCollection.findOne({ email: credentials.email });

if (!user) {
  throw new Error('Email ou mot de passe incorrect');
}
```

**Si l'email n'existe pas dans MongoDB → Accès refusé ❌**

---

## 🔐 Authentification NextAuth

### Méthodes de Connexion

#### 1. Email + Password (Première connexion)
```typescript
POST /api/auth/callback/credentials
{
  "email": "admin@example.com",
  "password": "VotreMotDePasse123"
}
```

**Vérifications** :
- ✅ Email existe dans la collection `users`
- ✅ Mot de passe correspond au hash bcrypt en BD
- ✅ Rôle valide (`dev`, `admin`, `staff`)

#### 2. Email + PIN (PWA, connexions suivantes)
```typescript
POST /api/auth/callback/credentials
{
  "email": "admin@example.com",
  "password": "123456" // PIN 6 chiffres
}
```

**Vérifications** :
- ✅ Email existe dans la collection `users`
- ✅ PIN correspond au hash SHA-256 en localStorage
- ✅ Session NextAuth valide

#### 3. PIN seul (Employés via dashboard)
```typescript
POST /api/auth/callback/credentials
{
  "password": "123456" // PIN 6 chiffres, pas d'email
}
```

**Vérifications** :
- ✅ PIN correspond au `dashboardPinHash` d'un employé actif
- ✅ Employé a le rôle `Manager` ou `Assistant manager`
- ✅ Rôle système attribué automatiquement selon `employeeRole`

---

## 👥 Contrôle d'Accès Basé sur les Rôles (RBAC)

### Rôles Système

| Rôle | Slug | Accès | Création |
|------|------|-------|----------|
| **Développeur** | `dev` | Complet (debug tools) | MongoDB direct |
| **Admin** | `admin` | Gestion HR + Comptabilité | MongoDB direct |
| **Staff** | `staff` | Lecture planning/pointage | MongoDB direct |
| **Client** | `client` | Non autorisé sur /admin | Inscription site public |

### Permissions par Rôle

#### Dev (Développeur)
```typescript
✅ Accès complet à toutes les routes
✅ Debug tools (/admin/debug/*)
✅ Gestion employés (CRUD)
✅ Gestion comptabilité
✅ Modification pointages
✅ Configuration système
```

#### Admin (Administrateur)
```typescript
✅ Gestion employés (CRUD)
✅ Gestion comptabilité
✅ Modification pointages
✅ Configuration planning
❌ Debug tools (dev uniquement)
```

#### Staff (Employé)
```typescript
✅ Consultation planning personnel
✅ Pointage entrée/sortie
✅ Consultation historique pointages
❌ Modification données
❌ Accès comptabilité
❌ Gestion autres employés
```

#### Client
```typescript
❌ Aucun accès à /admin
❌ Redirection vers /403
```

### Protection des Routes API

**Pattern obligatoire** dans toutes les API routes :

```typescript
// apps/admin/src/app/api/hr/employees/route.ts
import { requireAuth } from '@/lib/api/auth'

export async function GET(request: Request) {
  // Vérification OBLIGATOIRE
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) {
    return authResult.response // 401 ou 403
  }

  // Logique métier uniquement si autorisé
  // ...
}
```

**Exceptions** (routes publiques) :
- `/api/auth/[...nextauth]` - Endpoint NextAuth
- `/api/hr/employees/verify-pin` - Vérification PIN pointage
- `/api/time-entries/clock-in` - Pointage entrée
- `/api/time-entries/clock-out` - Pointage sortie

---

## 🌐 Restriction IP (Dashboard Staff)

### Principe

Les routes staff `/(dashboard)` sont protégées par IP pour n'être accessibles **que depuis les locaux**.

```typescript
// apps/admin/src/middleware.ts
const isDashboardRoute =
  pathname === '/' ||
  pathname.startsWith('/clocking') ||
  pathname.startsWith('/my-schedule') ||
  pathname.startsWith('/produits');

if (isDashboardRoute && !isIPAllowed(clientIP, allowedIPs)) {
  // PWA → Redirect /admin
  // Web → Redirect /403
}
```

### Configuration

```bash
# .env.production
ALLOWED_STAFF_IPS=192.168.1.0/24,10.0.0.5,172.16.0.0/12
```

**Support** :
- ✅ Adresses IP uniques (`192.168.1.50`)
- ✅ Plages CIDR (`192.168.1.0/24`)
- ✅ Combinaisons multiples (séparées par `,`)

### Comportement selon Client

| Type Client | IP Autorisée | IP Refusée |
|-------------|--------------|------------|
| **PWA** | ✅ Accès staff | 🔄 Redirect `/admin` (login classique) |
| **Web** | ✅ Accès staff | 🚫 Redirect `/403` (accès refusé) |

**Raison** : PWA n'a pas de barre d'adresse, donc redirect automatique vers `/admin` pour permettre connexion.

---

## 📱 Système PIN PWA

### Principe

- **Première ouverture PWA** : Email + Password → Setup PIN
- **Ouvertures suivantes** : PIN seulement (accès rapide)

### Sécurité PIN

#### Hashage SHA-256
```typescript
// apps/admin/src/contexts/PINAuthContext.tsx
async function hashPIN(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

**Stockage** :
- localStorage : `pin_hash` (hash SHA-256)
- localStorage : `pin_user_id` (lié à l'utilisateur)

#### Rate Limiting (3 tentatives)
```typescript
// apps/admin/src/components/PINLogin.tsx
if (newAttempts >= 3) {
  // Reset PIN + Logout automatique
  setTimeout(() => {
    resetPIN();
    signOut({ callbackUrl: '/login' });
  }, 2000);
}
```

**Après 3 échecs** :
1. PIN réinitialisé
2. Logout automatique
3. Obligation de se reconnecter avec Email + Password
4. Nouveau setup PIN requis

#### Lien avec Utilisateur
```typescript
// Vérification à chaque login PIN
if (storedUserId !== session.user.id) {
  // PIN d'un autre utilisateur → Invalid
  return false;
}
```

---

## 🛡️ Protection API

### Toutes les Routes Protégées

```typescript
// Checklist de sécurité pour chaque API route :

✅ 1. Import requireAuth
import { requireAuth } from '@/lib/api/auth'

✅ 2. Vérification au début de la fonction
const authResult = await requireAuth(['dev', 'admin'])
if (!authResult.authorized) return authResult.response

✅ 3. Try/catch pour erreurs
try {
  // Logique métier
} catch (error) {
  return errorResponse('Message', error.message)
}

✅ 4. Validation des inputs
if (!body.email || !body.password) {
  return errorResponse('Données manquantes', '...', 400)
}

✅ 5. Connexion DB
await connectMongoose()
```

### Codes d'Erreur HTTP

| Code | Usage | Exemple |
|------|-------|---------|
| 200 | Succès GET | Liste d'employés |
| 201 | Succès POST (création) | Nouvel employé créé |
| 400 | Erreur validation | Champs manquants |
| 401 | Non authentifié | Pas de session |
| 403 | Permission refusée | Role insuffisant |
| 404 | Ressource introuvable | Employé inexistant |
| 500 | Erreur serveur | Erreur DB, etc. |

---

## 🔑 Ajouter un Nouvel Admin

### ⚠️ Procédure Obligatoire

**Les admins ne peuvent PAS être créés via l'application.**
→ Création manuelle dans MongoDB uniquement.

### Méthode 1 : MongoDB Compass / mongosh

```javascript
use coworking_cafe_db

// 1. Vérifier le rôle admin existe
db.roles.findOne({ slug: 'admin' })

// 2. Hash le mot de passe (avec bcrypt)
// Utiliser un outil en ligne ou script Node.js
const bcrypt = require('bcrypt')
const hashedPassword = await bcrypt.hash('VotreMotDePasse123', 10)

// 3. Créer l'utilisateur
db.users.insertOne({
  email: 'nouvel.admin@coworkingcafe.fr',
  password: hashedPassword, // Hash bcrypt ci-dessus
  givenName: 'Prénom',
  username: 'nouvel.admin',
  role: ObjectId('...'), // ID du rôle admin
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Méthode 2 : Script Node.js

```bash
# Créer un script d'administration
touch scripts/create-admin.js
```

```javascript
// scripts/create-admin.js
const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function createAdmin() {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db('coworking_cafe_db')

    // Demander les infos
    const email = await question('Email : ')
    const password = await question('Mot de passe : ')
    const givenName = await question('Prénom : ')

    // Trouver le rôle admin
    const adminRole = await db.collection('roles').findOne({ slug: 'admin' })
    if (!adminRole) {
      console.error('❌ Rôle admin non trouvé')
      return
    }

    // Hash le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'admin
    await db.collection('users').insertOne({
      email: email.toLowerCase(),
      password: hashedPassword,
      givenName,
      username: email.split('@')[0],
      role: adminRole._id,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('✅ Admin créé avec succès')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Mot de passe: ${password}`)
    console.log('⚠️  Notez ces informations dans un endroit sûr !')
  } finally {
    await client.close()
    rl.close()
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

createAdmin()
```

```bash
# Exécuter le script
MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js
```

---

## 🧪 Tests de Sécurité

### Checklist Tests Manuels

#### Authentification
- [ ] Connexion avec email invalide → Erreur ❌
- [ ] Connexion avec password incorrect → Erreur ❌
- [ ] Connexion avec rôle `client` → Redirect 403 ❌
- [ ] Connexion avec rôle `admin` → Succès ✅
- [ ] Logout → Redirect /login ✅

#### Restriction IP (Staff)
- [ ] Accès `/(dashboard)` depuis IP autorisée → Succès ✅
- [ ] Accès `/(dashboard)` depuis IP externe (web) → Redirect 403 ❌
- [ ] Accès `/(dashboard)` depuis IP externe (PWA) → Redirect /admin ✅
- [ ] Accès `/admin` depuis IP externe → Login normal ✅

#### PIN PWA
- [ ] Setup PIN première fois → Stocké en localStorage ✅
- [ ] Login PIN valide → Accès immédiat ✅
- [ ] Login PIN invalide 1x → Erreur, 2 tentatives restantes ⚠️
- [ ] Login PIN invalide 3x → Logout + Reset PIN ❌
- [ ] PIN oublié → Reset + Redirect /login ✅

#### Protection API
- [ ] GET /api/hr/employees sans auth → 401 ❌
- [ ] GET /api/hr/employees avec role=staff → 200 ✅
- [ ] POST /api/hr/employees avec role=staff → 403 ❌
- [ ] POST /api/hr/employees avec role=admin → 201 ✅

---

## 🚨 Incidents de Sécurité

### Que Faire Si...

#### Un Employé Perd son Téléphone PWA
1. Réinitialiser le PIN dans MongoDB (supprimer `dashboardPinHash`)
2. L'employé devra se reconnecter avec Email + Password
3. Setup nouveau PIN

#### Un Admin Oublie son Mot de Passe
1. Reset password via MongoDB (hash bcrypt nouveau password)
2. Ou créer un nouveau compte admin si email compromis

#### Tentative d'Accès Non Autorisé Détectée
1. Vérifier les logs NextAuth (`console.log` dans auth-options.ts)
2. Bloquer l'IP si attaque répétée (via pare-feu serveur)
3. Activer rate limiting sur Vercel/Northflank si nécessaire

---

## 📊 Améliorations Futures (Production)

### À Implémenter pour Production

1. **PIN côté serveur**
   ```typescript
   // Stocker le hash PIN en DB, pas localStorage
   // Avantage : Multi-device, plus sécurisé
   interface User {
     pwaPin?: string // bcrypt hash
   }
   ```

2. **Rate limiting global**
   ```typescript
   // Limiter à 5 tentatives/5min par IP
   // Via middleware ou service externe (Cloudflare, Vercel)
   ```

3. **Authentification biométrique (optionnel)**
   ```typescript
   // Face ID / Touch ID pour PIN
   // Via Web Authentication API
   if (await navigator.credentials.get({ publicKey })) {
     // Auto-login
   }
   ```

4. **Logs d'audit**
   ```typescript
   // Tracer toutes les actions sensibles
   interface AuditLog {
     userId: string
     action: 'login' | 'logout' | 'create' | 'update' | 'delete'
     resource: string
     timestamp: Date
     ip: string
   }
   ```

5. **2FA (Two-Factor Authentication)**
   ```typescript
   // Email ou SMS avec code à usage unique
   // Via Resend ou Twilio
   ```

---

## 📚 Ressources

### Documentation Interne
- `/apps/admin/PWA_AUTH.md` - Système d'authentification PWA
- `/apps/admin/IP_SECURITY.md` - Restriction IP pour staff
- `/apps/admin/CLAUDE.md` - Guide développement

### Documentation Externe
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)

---

**Dernière mise à jour** : 2026-01-30
**Responsable sécurité** : Dev Team
**Niveau de sécurité actuel** : ⚠️ Développement (OK pour staging)
**Niveau de sécurité requis (prod)** : 🔒 Production (implémenter améliorations ci-dessus)
