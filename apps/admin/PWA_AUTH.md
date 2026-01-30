# PWA - Authentification PIN

## 🎯 Vue d'ensemble

L'application admin utilise un **système d'authentification à deux niveaux** pour la PWA :

1. **Première connexion** : Email + Password (NextAuth)
2. **Connexions suivantes** : Code PIN à 6 chiffres

---

## 🔄 Flux d'Authentification

### 1️⃣ Première Ouverture PWA

```
1. Utilisateur ouvre PWA
2. Pas de session → Redirect /login
3. Login avec Email + Password
4. ✅ Login réussi → Écran "Configurer votre PIN"
5. Utilisateur crée un PIN à 6 chiffres
6. PIN hashé et sauvegardé en localStorage
7. ✅ Accès à l'admin panel
```

### 2️⃣ Ouvertures Suivantes

```
1. Utilisateur ouvre PWA
2. Session existe + PIN configuré → Écran "Entrez votre PIN"
3. Utilisateur saisit PIN
4. PIN vérifié (comparé au hash localStorage)
5. ✅ Accès immédiat à l'admin panel
```

### 3️⃣ PIN Oublié

```
1. Utilisateur clique "PIN oublié ?"
2. Confirmation → Reset PIN + Logout
3. Redirect /login
4. Recommence le flux 1️⃣
```

---

## 🔒 Sécurité

### Stockage du PIN

- **Hashé** avec SHA-256 avant stockage
- **localStorage** : Persiste entre sessions
- **Lié à l'utilisateur** : Vérifié avec `user.id`

### Protection contre Brute-Force

- **3 tentatives maximum**
- Après 3 échecs : Reset PIN + Logout automatique
- Obligation de se reconnecter avec Email/Password

### En Production (À améliorer)

```typescript
// TODO en production :
// 1. Hasher côté serveur avec bcrypt/argon2
// 2. Stocker hash PIN en DB (pas localStorage)
// 3. Rate limiting API (max 3 tentatives/5min)
// 4. Biométrie optionnelle (Face ID, Touch ID)
```

---

## 🌐 Différence PWA vs Web

### Mode PWA (Standalone)

```
Ouverture app
    │
    ▼
Vérification PIN
    │
    ▼
Accès admin
```

### Mode Web (Navigateur)

```
Navigation normale
    │
    ▼
Login email/password classique
    │
    ▼
Accès admin
```

**Détection automatique** via `window.matchMedia('(display-mode: standalone)')`.

---

## 🛠️ Configuration

### Activer/Désactiver PIN

Le système PIN est **automatiquement activé en mode PWA**.

Pour désactiver temporairement (dev) :

```typescript
// apps/admin/src/contexts/PINAuthContext.tsx
// Ligne 21 - Forcer mode Web
const isPWA = false; // Au lieu de useIsPWA()
```

---

## 📱 Installation PWA

### Android (Chrome)

1. Ouvrir `https://admin.coworkingcafe.fr/admin`
2. Menu ⋮ → "Installer l'application"
3. Confirmer
4. Icône ajoutée sur l'écran d'accueil

### iOS (Safari)

1. Ouvrir `https://admin.coworkingcafe.fr/admin`
2. Partager 🔼 → "Sur l'écran d'accueil"
3. Nommer "CoWorking Admin"
4. Ajouter

### Desktop (Chrome/Edge)

1. Ouvrir `https://admin.coworkingcafe.fr/admin`
2. Icône ⊕ dans barre d'adresse → "Installer"
3. Confirmer

---

## 🎨 Interface PIN

### Écran Setup (Première fois)

```
┌─────────────────────────────────┐
│         🛡️                       │
│  Configurer votre Code PIN      │
│                                 │
│  Bienvenue Marie!               │
│  Créez un code PIN à 6 chiffres│
│                                 │
│  Code PIN (6 chiffres)          │
│  [••••••]                       │
│                                 │
│  Confirmer le Code PIN          │
│  [••••••]                       │
│                                 │
│  [Configurer le PIN]            │
└─────────────────────────────────┘
```

### Écran Login (Suivantes)

```
┌─────────────────────────────────┐
│         🔒                       │
│  Entrez votre Code PIN          │
│                                 │
│  Saisissez votre code PIN       │
│  à 6 chiffres                   │
│                                 │
│  [••••••]                       │
│                                 │
│  [Déverrouiller]                │
│                                 │
│  PIN oublié ? Se reconnecter    │
└─────────────────────────────────┘
```

---

## 🔧 Développement

### Composants Créés

```
apps/admin/src/
├── components/
│   ├── PWADetector.tsx         # Détecte mode PWA
│   ├── PWAAuth.tsx             # Wrapper auth PWA
│   ├── PINSetup.tsx            # Setup PIN première fois
│   └── PINLogin.tsx            # Login PIN suivantes
│
└── contexts/
    └── PINAuthContext.tsx      # État PIN (Provider + Hook)
```

### Hook usePINAuth

```typescript
import { usePINAuth } from '@/contexts/PINAuthContext';

function MyComponent() {
  const {
    isPWA,          // boolean - Mode PWA ?
    isPINSet,       // boolean - PIN configuré ?
    isPINVerified,  // boolean - PIN vérifié ?
    isLoading,      // boolean - Chargement
    setupPIN,       // (pin: string) => Promise<void>
    verifyPIN,      // (pin: string) => Promise<boolean>
    resetPIN,       // () => void
  } = usePINAuth();
}
```

---

## 🧪 Tests

### Test 1 : Première Installation

1. Installer PWA
2. Ouvrir → Redirect /login
3. Login email/password
4. Écran Setup PIN → Créer PIN `123456`
5. Confirmer PIN `123456`
6. ✅ Accès admin panel

### Test 2 : Réouverture

1. Fermer PWA
2. Réouvrir PWA
3. Écran Login PIN
4. Saisir PIN `123456`
5. ✅ Accès immédiat admin panel

### Test 3 : PIN Incorrect

1. Ouvrir PWA
2. Saisir PIN `111111` (incorrect)
3. Erreur "Code PIN incorrect (1/3 tentatives)"
4. Saisir PIN `222222` (incorrect)
5. Erreur "Code PIN incorrect (2/3 tentatives)"
6. Saisir PIN `333333` (incorrect)
7. Erreur "Trop de tentatives" → Logout automatique
8. Redirect /login

### Test 4 : PIN Oublié

1. Ouvrir PWA → Écran PIN
2. Cliquer "PIN oublié ? Se reconnecter"
3. Confirmation → Reset PIN
4. Redirect /login
5. Login email/password
6. Setup nouveau PIN

---

## 📊 Workflow Complet

```
┌──────────────────────────────────────────┐
│  Utilisateur ouvre PWA                   │
└──────────────┬───────────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ Session ?     │
       └───┬───────┬───┘
           │       │
          NON     OUI
           │       │
           ▼       ▼
    ┌──────────┐  ┌──────────┐
    │ /login   │  │ PIN Set? │
    │ Email+PW │  └─┬──────┬─┘
    └────┬─────┘    │      │
         │         NON    OUI
         │          │      │
         │          ▼      ▼
         │    ┌──────────┐ ┌──────────┐
         └───→│Setup PIN │ │Login PIN │
              └────┬─────┘ └────┬─────┘
                   │            │
                   └──────┬─────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Admin Panel │
                   └─────────────┘
```

---

## ✅ Checklist Déploiement PWA

- [ ] Manifest configuré (`/manifest.webmanifest`)
- [ ] Icons 192x192 et 512x512 disponibles
- [ ] Service Worker enregistré (optionnel)
- [ ] HTTPS activé (requis pour PWA)
- [ ] PINAuthProvider intégré dans Providers
- [ ] PWADetector ajouté au layout root
- [ ] Test installation PWA sur mobile
- [ ] Test flow PIN complet
- [ ] Test 3 tentatives échecs
- [ ] Test reset PIN

---

**Dernière mise à jour** : 2026-01-30
