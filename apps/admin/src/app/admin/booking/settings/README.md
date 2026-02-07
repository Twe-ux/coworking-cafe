# Réglages Réservations - Structure Modulaire

Ce dossier contient la page de réglages des réservations, découpée en composants modulaires pour respecter la limite de 200 lignes par fichier.

## Structure

```
settings/
├── BookingSettingsClient.tsx     # Composant principal (110 lignes)
├── page.tsx                       # Page Next.js
├── types.ts                       # Types et constantes (50 lignes)
├── README.md                      # Cette documentation
├── components/                    # Composants UI
│   ├── CancellationPolicyCard.tsx # Politique d'annulation (92 lignes)
│   ├── AutomationCard.tsx         # Horaires automatisations (58 lignes)
│   ├── NotificationCard.tsx       # Email notifications (37 lignes)
│   └── DepositPolicyCard.tsx      # Politique d'acompte (90 lignes)
└── hooks/                         # Logique métier
    ├── useBookingSettings.ts      # Hook principal (188 lignes)
    └── settingsHelpers.ts         # Helpers de transformation (67 lignes)
```

## Tailles des Fichiers

| Fichier | Lignes | Status |
|---------|--------|--------|
| BookingSettingsClient.tsx | 110 | ✅ < 200 |
| types.ts | 50 | ✅ < 200 |
| useBookingSettings.ts | 188 | ✅ < 200 |
| settingsHelpers.ts | 67 | ✅ < 200 |
| CancellationPolicyCard.tsx | 92 | ✅ < 200 |
| DepositPolicyCard.tsx | 90 | ✅ < 200 |
| AutomationCard.tsx | 58 | ✅ < 200 |
| NotificationCard.tsx | 37 | ✅ < 200 |

**Total: 692 lignes** (vs 614 lignes originales)

## Fonctionnalités

### 1. Politique d'Annulation (Open-Space et Salles)

- Gestion des paliers de frais d'annulation
- Ajout/suppression de paliers
- Configuration jours avant + pourcentage encaissé

### 2. Automatisations (Cron)

- Heure de vérification des présences (J-1)
- Heure d'envoi du récapitulatif quotidien

### 3. Notifications

- Configuration de l'email de destination pour les rapports

### 4. Politique d'Acompte

- Montant minimum requis pour demander un acompte
- Pourcentage par défaut de l'acompte
- Types d'espaces concernés (checkbox multi-sélection)

## API Utilisée

**Endpoint**: `/api/booking-settings`

**Méthodes**:
- `GET` - Récupérer les réglages actuels
- `POST` - Enregistrer les nouveaux réglages

## Types Principaux

```typescript
interface BookingSettings {
  cancellationPolicyOpenSpace: CancellationPolicyTier[]
  cancellationPolicyMeetingRooms: CancellationPolicyTier[]
  cronSchedules: {
    attendanceCheckTime: string
    dailyReportTime: string
  }
  depositPolicy: {
    minAmountRequired: number
    defaultPercent: number
    applyToSpaces: string[]
  }
  notificationEmail: string
}
```

## Améliorations Apportées

### Par rapport au fichier original (614 lignes)

1. **Modularité** - Chaque section UI dans son propre composant
2. **Séparation des responsabilités** - Logique dans hooks, UI dans composants
3. **Réutilisabilité** - `CancellationPolicyCard` utilisé 2x (Open-Space + Meeting Rooms)
4. **Maintenabilité** - Fichiers < 200 lignes, faciles à comprendre
5. **Types partagés** - Types centralisés dans `types.ts`
6. **Helpers purs** - Fonctions de transformation dans `settingsHelpers.ts`

## Conventions Respectées

- ✅ **Fichiers < 200 lignes** (tous les fichiers)
- ✅ **Zéro `any` types** (TypeScript strict)
- ✅ **Composants réutilisables** (CancellationPolicyCard)
- ✅ **Props typées** (interfaces pour tous les props)
- ✅ **Hooks personnalisés** (logique extraite)
- ✅ **Nommage descriptif** (fonctions et variables claires)

## Utilisation

```tsx
import { BookingSettingsClient } from './BookingSettingsClient'

export default function SettingsPage() {
  return <BookingSettingsClient />
}
```

Le composant gère tout l'état interne et les appels API de manière autonome.
