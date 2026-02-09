# 📧 Guide des Templates Emails - CoworKing Café

> **Dernière mise à jour** : 2026-02-09
> **Status** : 🔴 Nécessite nettoyage (doublons et confusion)

---

## 📍 Localisation Actuelle

### Package Partagé : `@coworking-cafe/email`
**Chemin** : `/packages/email/src/templates/`
**Usage** : Templates partagés entre Admin et Site

```
📦 @coworking-cafe/email/src/templates/
├── adminValidation.ts           → Admin valide réservation client
├── adminRejection.ts            → Admin rejette réservation client
├── adminBookingValidation.ts    → Admin valide sa réservation (sans CB)
├── adminBookingRejection.ts     → Admin rejette sa réservation
├── adminBookingCancellation.ts  → Admin annule sa réservation
├── pendingWithDeposit.ts        → Résa en attente avec empreinte CB
├── clientPresent.ts             → Client marqué présent (no-show N)
├── clientNoShow.ts              → Client no-show (capture empreinte)
├── bookingModified.ts           → Modification de réservation
└── helpers.ts                   → Utilitaires (getSpaceDisplayName)
```

### App Site : `apps/site`
**Chemin** : `/apps/site/src/lib/email/templates/`
**Usage** : Templates spécifiques au site public

```
🌐 apps/site/src/lib/email/templates/
├── clientBookingConfirmation.ts → Client crée réservation
├── clientCancellation.ts        → Client annule réservation
├── depositHold.ts               → Empreinte CB prise
├── depositReleased.ts           → Empreinte CB libérée
├── cardSaved.ts                 → Carte bancaire enregistrée
├── reminder.ts                  → Rappel réservation (cron)
├── noShowPenalty.ts             → Pénalité no-show
├── passwordReset.ts             → Reset mot de passe
├── confirmation.ts              → Confirmation générique
│
├── ⚠️ adminValidation.ts        → DOUBLON (réexporté du package)
├── ⚠️ adminRejection.ts         → VARIANTE (différent du package)
├── ⚠️ adminCancellation.ts      → À VÉRIFIER
└── ⚠️ helpers.ts                → DOUBLON
```

---

## 🔴 Problèmes Identifiés

### 1. Doublons et Confusion

| Fichier | Package | Site | Status |
|---------|---------|------|--------|
| `adminValidation.ts` | ✅ Existe | ⚠️ Doublon + Réexporté | 🔴 Confusion |
| `adminRejection.ts` | ✅ Existe | ⚠️ Variante (rejectionReason) | 🟡 À consolider |
| `adminCancellation.ts` | ✅ Existe | ⚠️ Existe aussi | 🔴 À vérifier |
| `helpers.ts` | ✅ Existe | ⚠️ Doublon | 🔴 Supprimer |

### 2. Index.ts Incohérent

Le fichier `apps/site/src/lib/email/templates/index.ts` :
- **Réexporte** `adminValidation` depuis `@coworking-cafe/email`
- Mais le fichier local `adminValidation.ts` **existe toujours** dans site
- Résultat : **confusion sur quel template est utilisé**

```typescript
// ❌ ACTUEL - Confus
export { generateValidatedEmail } from '@coworking-cafe/email';
// Mais adminValidation.ts existe localement aussi !
```

---

## ✅ Stratégie de Nettoyage Recommandée

### Principe : Single Source of Truth

```
📦 PACKAGE PARTAGÉ (@coworking-cafe/email)
→ Templates utilisés par ADMIN et SITE
→ Actions administratives
→ Système (présence, no-show, modifications)

🌐 APP SITE (apps/site)
→ Templates UNIQUEMENT utilisés par le site
→ Actions clients (réservation, annulation)
→ Processus métier site (empreinte CB, rappels, auth)
```

### Actions à Faire

#### Étape 1 : Nettoyer les Doublons (Site)

```bash
# Supprimer doublons inutiles
cd apps/site/src/lib/email/templates/

# ❌ Supprimer (déjà dans package)
rm adminValidation.ts
rm helpers.ts

# 🔍 Comparer avant de supprimer
diff adminRejection.ts ../../../packages/email/src/templates/adminRejection.ts
diff adminCancellation.ts ../../../packages/email/src/templates/adminCancellation.ts
```

#### Étape 2 : Consolider les Variantes

**Option A** : `adminRejection` du site est meilleur (gestion rejectionReason)
→ Migrer vers package et supprimer du site

**Option B** : Les deux sont nécessaires (cas d'usage différents)
→ Renommer clairement (ex: `adminRejectionWithReason.ts`)

#### Étape 3 : Mettre à Jour les Imports

```typescript
// apps/site/src/lib/email/templates/index.ts

// ✅ NOUVEAU - Clair
// Tout ce qui vient du package
export {
  generateValidatedEmail,
  generateReservationRejectedEmail,
  generateAdminBookingValidationEmail,
  generateAdminBookingRejectionEmail,
  generateAdminBookingCancellationEmail,
  generateClientPresentEmail,
  generateClientNoShowEmail,
  generateBookingModifiedEmail,
  generatePendingWithDepositEmail,
  getSpaceDisplayName,
} from '@coworking-cafe/email';

// Templates spécifiques au site
export { generateBookingInitialEmail } from './clientBookingConfirmation';
export { generateCancellationEmail } from './clientCancellation';
export { generateDepositHoldEmail } from './depositHold';
export { generateDepositReleasedEmail } from './depositReleased';
export { generateCardSavedEmail } from './cardSaved';
export { generateReminderEmail } from './reminder';
export { generateDepositCapturedEmail } from './noShowPenalty';
export { passwordResetEmail } from './passwordReset';
export { generateConfirmationEmail } from './confirmation';
```

#### Étape 4 : Documenter

Créer `README.md` dans chaque dossier :

**Package Email** :
```markdown
# Templates Emails Partagés

Templates utilisés par **Admin** et **Site**.

## Règle
- ✅ Ajouter ici les templates utilisés par LES DEUX apps
- ❌ Ne pas ajouter de templates spécifiques à une seule app
```

**Site** :
```markdown
# Templates Emails Site

Templates utilisés **UNIQUEMENT** par le site public.

## Règle
- ✅ Actions clients (booking, cancellation)
- ✅ Processus métier site (empreinte CB, rappels)
- ❌ Actions admin → Utiliser @coworking-cafe/email
```

---

## 🎯 Organisation Cible

### Package Partagé (Final)

```
@coworking-cafe/email/src/templates/
├── 📋 ADMIN ACTIONS
│   ├── adminValidation.ts
│   ├── adminRejection.ts
│   ├── adminBookingValidation.ts
│   ├── adminBookingRejection.ts
│   └── adminBookingCancellation.ts
├── 👥 CLIENT PRESENCE
│   ├── clientPresent.ts
│   └── clientNoShow.ts
├── 🔄 BOOKING SYSTEM
│   ├── bookingModified.ts
│   └── pendingWithDeposit.ts
└── 🛠️ UTILS
    └── helpers.ts
```

### Site (Final)

```
apps/site/src/lib/email/templates/
├── 👤 CLIENT ACTIONS
│   ├── clientBookingConfirmation.ts
│   └── clientCancellation.ts
├── 💳 PAYMENT
│   ├── depositHold.ts
│   ├── depositReleased.ts
│   ├── cardSaved.ts
│   └── noShowPenalty.ts
├── ⏰ CRON
│   └── reminder.ts
├── 🔐 AUTH
│   └── passwordReset.ts
└── 📧 GENERIC
    └── confirmation.ts
```

---

## 📝 Convention de Nommage

### ✅ BON

```typescript
// Préfixe clair indiquant l'acteur
generateClientBookingConfirmationEmail()  // Action du client
generateAdminValidationEmail()            // Action de l'admin
generateDepositHoldEmail()                // Action système
```

### ❌ MAUVAIS

```typescript
// Ambigu - Qui fait l'action ?
generateConfirmationEmail()
generateRejectionEmail()
generateValidationEmail()
```

---

## 🧪 Vérification

Après nettoyage, vérifier :

```bash
# 1. Aucun doublon
find apps/site/src/lib/email/templates packages/email/src/templates \
  -name "*.ts" ! -name "index.ts" -exec basename {} \; | sort | uniq -d

# 2. Tous les imports fonctionnent
pnpm --filter @coworking-cafe/site type-check
pnpm --filter @coworking-cafe/admin type-check

# 3. Build réussit
pnpm build
```

---

## 🚨 À Ne PAS Faire

- ❌ **Ne pas dupliquer** un template juste pour le modifier légèrement
- ❌ **Ne pas créer** de template dans site si admin pourrait l'utiliser aussi
- ❌ **Ne pas réexporter** depuis package si template local existe

## ✅ À Faire

- ✅ **Toujours vérifier** si template existe déjà dans package
- ✅ **Ajouter au package** si utilisé par admin ET site
- ✅ **Documenter** les cas d'usage dans les commentaires

---

**Prochaine étape** : Exécuter le nettoyage (Étapes 1-4) pour clarifier l'organisation.
