# ReservationDialog - Documentation

## Vue d'ensemble

Ce module contient le formulaire de création/édition de réservation, refactorisé en composants modulaires pour respecter les conventions du projet (fichiers < 200 lignes, zéro `any` types).

## Structure

```
reservation-dialog/
├── index.ts                          (13 lignes)  - Export principal
├── types.ts                          (52 lignes)  - Types TypeScript
├── utils.ts                          (92 lignes)  - Utilitaires
├── useReservationForm.ts            (102 lignes)  - Hook logique formulaire
├── useSpaces.ts                      (45 lignes)  - Hook chargement espaces
├── ReservationDialogContent.tsx      (86 lignes)  - Composant principal
├── ClientInfoSection.tsx             (35 lignes)  - Section client
├── SpaceSelectionSection.tsx         (60 lignes)  - Sélection espace
├── DateTimeSection.tsx               (76 lignes)  - Dates et heures
├── PricingSection.tsx                (36 lignes)  - Tarification
├── ReservationStatusSection.tsx      (50 lignes)  - Statut et notes
└── README.md                                      - Ce fichier
```

**Fichier original** : ReservationDialog.tsx (416 lignes) → maintenant 5 lignes (re-export)

## Architecture

### 1. Types (`types.ts`)

Définit tous les types utilisés par les composants :
- `ReservationFormData` - Données du formulaire
- `ReservationDialogProps` - Props du dialog principal
- `*SectionProps` - Props pour chaque section

### 2. Utilitaires (`utils.ts`)

Fonctions pures pour :
- `calculateReservationPrice()` - Calcul du prix selon type/espace/nombre de personnes
- `getInitialFormData()` - Initialisation formulaire vide
- `bookingToFormData()` - Conversion Booking → FormData

### 3. Hooks Personnalisés

#### `useReservationForm.ts`
Gère toute la logique du formulaire :
- État du formulaire
- Calcul automatique du prix
- Soumission à l'API
- Initialisation/réinitialisation

#### `useSpaces.ts`
Charge la liste des espaces disponibles depuis l'API.

### 4. Composants de Section

Chaque section du formulaire est un composant séparé :

- **ClientInfoSection** : Nom et email du client
- **SpaceSelectionSection** : Choix de l'espace et type de réservation
- **DateTimeSection** : Dates, heures (si hourly), nombre de personnes
- **PricingSection** : Prix total et acompte
- **ReservationStatusSection** : Statut et notes

### 5. Composant Principal

**ReservationDialogContent.tsx** :
- Utilise les hooks (`useReservationForm`, `useSpaces`)
- Assemble toutes les sections
- Gère la soumission du formulaire

## Utilisation

### Import

```typescript
// Via le re-export (recommandé)
import { ReservationDialog } from "./ReservationDialog"

// Ou directement
import { ReservationDialog } from "./reservation-dialog"
```

### Exemple

```typescript
<ReservationDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  booking={selectedBooking} // undefined pour création
  onSuccess={handleSuccess}
/>
```

## Avantages de la Refactorisation

### Avant (416 lignes)
- ❌ Fichier monolithique difficile à maintenir
- ❌ Logique mélangée avec UI
- ❌ Difficile à tester unitairement
- ❌ Réutilisation impossible

### Après (11 fichiers modulaires)
- ✅ Fichiers < 200 lignes (max 102 lignes)
- ✅ Séparation logique (hooks) / UI (composants)
- ✅ Sections réutilisables indépendamment
- ✅ Facile à tester (hooks + composants isolés)
- ✅ Zero `any` types
- ✅ Compatibilité maintenue (re-export)

## Conformité aux Conventions

### Types TypeScript
- ✅ Zéro `any` types
- ✅ Types importés de `@/types/booking`
- ✅ Interfaces pour props
- ✅ Types pour retours de hooks

### Taille des Fichiers
- ✅ Tous les fichiers < 200 lignes
- ✅ Plus gros fichier : `useReservationForm.ts` (102 lignes)
- ✅ Plus petit fichier : `index.ts` (13 lignes)

### Organisation
- ✅ Types dans fichier séparé
- ✅ Utilitaires dans fichier séparé
- ✅ Hooks personnalisés séparés
- ✅ Composants modulaires
- ✅ Re-export pour compatibilité

### Dates/Heures
- ✅ Format string (YYYY-MM-DD, HH:mm)
- ✅ Pas de Date objects dans le formulaire
- ✅ Conforme aux conventions du projet

## Tests à Effectuer

### Création de Réservation
1. Ouvrir le dialog sans booking (création)
2. Remplir tous les champs
3. Vérifier calcul automatique du prix
4. Soumettre et vérifier création en BD

### Édition de Réservation
1. Ouvrir le dialog avec un booking existant
2. Vérifier pré-remplissage des champs
3. Modifier des champs
4. Vérifier mise à jour en BD

### Validation
1. Champs requis (nom, email, espace, dates)
2. Format email
3. Nombre de personnes > 0
4. Date fin >= date début

### Calcul Prix
1. Changer type de réservation → prix recalculé
2. Changer espace → prix recalculé
3. Changer nombre de personnes → prix recalculé

### UI
1. Heures visibles seulement si type = "hourly"
2. Liste espaces filtrée (actifs uniquement)
3. Loading state pendant soumission
4. Messages d'erreur appropriés

## Maintenance Future

### Ajouter un Champ
1. Ajouter dans `ReservationFormData` (types.ts)
2. Ajouter dans `getInitialFormData()` (utils.ts)
3. Ajouter dans `bookingToFormData()` (utils.ts)
4. Créer une section ou ajouter à une existante
5. Mettre à jour le payload dans `useReservationForm.ts`

### Modifier le Calcul de Prix
→ Éditer `calculateReservationPrice()` dans `utils.ts`

### Ajouter une Validation
→ Éditer `handleSubmit()` dans `useReservationForm.ts`

### Réutiliser une Section
```typescript
// Exemple : réutiliser ClientInfoSection ailleurs
import { ClientInfoSection } from "@/app/admin/booking/reservations/reservation-dialog"
```

## Checklist de Refactorisation

- [x] Fichier original analysé (416 lignes)
- [x] Structure modulaire créée
- [x] Types extraits dans types.ts
- [x] Utilitaires extraits dans utils.ts
- [x] Hooks créés (useReservationForm, useSpaces)
- [x] Composants de section créés (5 sections)
- [x] Composant principal créé
- [x] Index.ts avec exports
- [x] Re-export pour compatibilité
- [x] Zéro `any` types
- [x] Tous fichiers < 200 lignes
- [x] Compilation TypeScript OK
- [x] Documentation créée

---

**Date de refactorisation** : 2026-01-20
**Fichier original** : 416 lignes → 11 fichiers modulaires (max 102 lignes)
**Conformité** : 100% conventions du projet
