# Module Réservations

Module de gestion des réservations clients.

## Structure

```
reservations/
├── ReservationsClient.tsx           # Composant principal (131 lignes)
├── ReservationsSkeleton.tsx         # Skeleton loader
├── ReservationDetailModal.tsx       # Modal de détail
├── EditBookingDialog.tsx            # Dialog d'édition
├── utils.ts                         # Utilitaires (formatage, badges)
├── components/                      # Composants UI
│   ├── ReservationsHeader.tsx       # En-tête avec boutons (35 lignes)
│   ├── ReservationsStats.tsx        # Cartes de statistiques (76 lignes)
│   ├── ReservationsTable.tsx        # Liste des réservations (52 lignes)
│   ├── ReservationCard.tsx          # Carte d'une réservation (196 lignes)
│   ├── QuickCancelDialog.tsx        # Dialog d'annulation rapide (64 lignes)
│   └── reservationCardUtils.ts      # Utilitaires pour les cartes (33 lignes)
├── hooks/                           # Logique métier
│   └── useReservationsLogic.tsx     # Hook principal (168 lignes)
└── reservation-dialog/              # Dialog de création (déjà découpé)
    ├── index.ts
    ├── types.ts
    ├── ReservationDialogContent.tsx
    ├── ClientSection.tsx
    ├── SpaceSection.tsx
    ├── DateSection.tsx
    ├── TimeSection.tsx
    ├── PeopleSection.tsx
    ├── PriceSection.tsx
    ├── DepositSection.tsx
    ├── StatusSection.tsx
    └── NotesSection.tsx
```

## Découpage Effectué

### Avant
- **ReservationsClient.tsx** : 584 lignes ❌

### Après
- **ReservationsClient.tsx** : 131 lignes ✅
- **Components** : 5 composants (35-196 lignes chacun) ✅
- **Hooks** : 1 hook (168 lignes) ✅
- **Utils** : 1 fichier (33 lignes) ✅

## Composants

### ReservationsClient.tsx (131 lignes)
Composant principal qui orchestre tous les autres composants.
- Utilise le hook `useReservationsLogic` pour la logique métier
- Gère l'affichage conditionnel (loading, error, success)
- Compose tous les sous-composants

### ReservationsHeader.tsx (35 lignes)
En-tête de la page avec titre et boutons d'action.
- Bouton "Nouvelle réservation"
- Lien vers l'agenda

### ReservationsStats.tsx (76 lignes)
Cartes de statistiques cliquables pour filtrer les réservations.
- Total, En attente, Confirmées, Annulées
- Visuellement indique le filtre actif avec un ring coloré

### ReservationsTable.tsx (52 lignes)
Liste des réservations avec gestion du cas vide.
- Affiche le nombre total de réservations
- Utilise ReservationCard pour chaque ligne

### ReservationCard.tsx (196 lignes)
Carte représentant une réservation dans la liste.
- Affichage complet des informations (espace, statut, client, type, date, heures, personnes, prix)
- Boutons d'action conditionnels selon le statut (Valider, Modifier, Annuler)
- Bordure colorée selon le type d'espace

### QuickCancelDialog.tsx (64 lignes)
Dialog pour annuler rapidement une réservation depuis la liste.
- Champ textarea pour la raison (optionnel)
- Boutons Annuler / Confirmer l'annulation

## Hooks

### useReservationsLogic.tsx (168 lignes)
Hook custom qui centralise toute la logique métier.

**State géré** :
- Messages (success/error)
- Filtres (statusFilter)
- Modals (detail, edit, create, quickCancel)
- Données de formulaire (quickCancelReason)

**Données** :
- Bookings (toutes + filtrées)
- Stats (total, pending, confirmed, cancelled)
- Loading/Error states

**Handlers** :
- `handleRowClick` : Ouvrir le détail
- `handleConfirm` : Confirmer une réservation
- `handleCancel` : Annuler une réservation
- `handleQuickCancelClick/Confirm/Close` : Annulation rapide
- `handleEditClick` : Éditer une réservation
- `handleEditSuccess` : Callback après édition réussie

**Mutations** :
- `confirmBooking` : Mutation TanStack Query pour confirmation
- `cancelBooking` : Mutation TanStack Query pour annulation

## Utilitaires

### reservationCardUtils.ts (33 lignes)
Fonctions utilitaires pour les cartes de réservation.
- `getSpaceType(spaceName)` : Détermine le type d'espace
- `getBorderClassBySpace(spaceName)` : Retourne la classe CSS de bordure
- `capitalize(name)` : Capitalise chaque mot

## Conventions Respectées

✅ **Fichier principal < 200 lignes** (131 lignes)
✅ **Composants < 200 lignes** (max 196 lignes pour ReservationCard)
✅ **Hooks < 200 lignes** (168 lignes)
✅ **Zero `any` types**
✅ **Logique métier extraite dans un hook**
✅ **Composants réutilisables et modulaires**
✅ **Props typées avec interfaces**

## Usage

```tsx
// Page parent (page.tsx)
import { ReservationsClient } from "./ReservationsClient";

export default function ReservationsPage() {
  return <ReservationsClient />;
}
```

## Modification Future

Si un composant dépasse 200 lignes, le découper davantage :
1. Identifier les sections distinctes
2. Extraire dans des sous-composants
3. Déplacer dans `/components/`
4. Importer et utiliser dans le parent

---

**Dernière mise à jour** : 2026-02-07
