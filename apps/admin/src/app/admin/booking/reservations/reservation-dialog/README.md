# Reservation Dialog - Structure

Ce dossier contient tous les composants et hooks nécessaires pour la création d'une nouvelle réservation.

## 📁 Structure

```
reservation-dialog/
├── components/                          # Composants et hooks du formulaire principal
│   ├── useReservationForm.ts           # Hook : Gestion de l'état du formulaire (156 lignes)
│   ├── useReservationValidation.ts     # Hook : Validation du formulaire (78 lignes)
│   ├── useReservationSubmit.ts         # Hook : Soumission à l'API (90 lignes)
│   ├── ReservationDialogSections.tsx   # Composant : Toutes les sections du formulaire (144 lignes)
│   ├── ReservationDialogFooter.tsx     # Composant : Footer avec boutons (47 lignes)
│   └── index.ts                        # Export de tous les composants/hooks
│
├── hooks/                               # Hooks métier spécifiques
│   └── useClientManagement.ts          # Hook : Gestion des clients (239 lignes) ✅
│
├── ReservationDialogContent.tsx        # Composant principal (79 lignes) ✅
│
├── ClientSection.tsx                   # Section : Recherche/création de client (136 lignes) ✅
├── ClientSearchInput.tsx               # Input de recherche client (65 lignes) ✅
├── ClientSearchResults.tsx             # Résultats de recherche client (60 lignes) ✅
├── ClientCreateForm.tsx                # Formulaire de création client (119 lignes) ✅
├── ClientEditForm.tsx                  # Formulaire d'édition client (103 lignes) ✅
├── SelectedClientDisplay.tsx           # Affichage du client sélectionné (80 lignes) ✅
│
├── SpaceSection.tsx                    # Section : Sélection de l'espace
├── DateSection.tsx                     # Section : Dates de réservation
├── TimeSection.tsx                     # Section : Heures de réservation
├── PeopleAndPriceSection.tsx           # Section : Nombre de personnes + Prix
├── PeopleSection.tsx                   # Section : Nombre de personnes
├── PriceSection.tsx                    # Section : Prix et facture
├── NotesSection.tsx                    # Section : Notes
├── DepositSection.tsx                  # Section : Acompte
├── StatusSection.tsx                   # Section : Statut de la réservation
│
├── types.ts                            # Types TypeScript partagés
├── index.ts                            # Export principal
└── README.md                           # Cette documentation
```

## 🎯 Objectif de la Refactorisation

Le fichier `ReservationDialogContent.tsx` faisait **507 lignes** avant refactorisation.

Après découpage :
- ✅ Fichier principal : **79 lignes** (< 200 lignes)
- ✅ Tous les composants/hooks : **< 200 lignes** chacun
- ✅ Logique extraite dans des hooks personnalisés
- ✅ Composants réutilisables et testables
- ✅ Respect des conventions du projet

## 🔧 Composants et Hooks

### Composants Principaux

#### `ReservationDialogContent.tsx`
Composant principal qui orchestre le dialogue de réservation.
- Utilise les hooks personnalisés pour la logique
- Affiche les sections et le footer
- Gère l'ouverture/fermeture du dialogue

#### `ReservationDialogSections.tsx`
Wrapper pour toutes les sections du formulaire.
- Affiche toutes les sections dans l'ordre
- Gère la logique conditionnelle (événementiel vs autres espaces)
- Propage les changements au formulaire principal

#### `ReservationDialogFooter.tsx`
Footer du dialogue avec les boutons d'action.
- Checkbox "Envoyer un email au client"
- Boutons Annuler / Valider

### Hooks Personnalisés

#### `useReservationForm.ts`
Gère l'état complet du formulaire de réservation.
- État du formulaire (`formData`)
- Calcul automatique du prix
- Ajustement du nombre de personnes selon la capacité
- Reset du formulaire

#### `useReservationValidation.ts`
Validation du formulaire avant soumission.
- Vérifie tous les champs requis
- Validation spécifique pour l'événementiel
- Validation de l'acompte si requis
- Logs détaillés pour le debug

#### `useReservationSubmit.ts`
Soumission du formulaire à l'API.
- Préparation du payload
- Appel API POST `/api/booking/reservations`
- Gestion des états de chargement
- Gestion des erreurs

### Sections du Formulaire

Chaque section est un composant indépendant qui :
- Affiche un ensemble de champs liés
- Propage les changements via callbacks
- Est réutilisable ailleurs si besoin

## 🚀 Utilisation

```tsx
import { ReservationDialog } from './reservation-dialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <ReservationDialog
      open={open}
      onOpenChange={setOpen}
      onSuccess={() => {
        console.log('Réservation créée !');
      }}
      initialDate={new Date()}
    />
  );
}
```

## ✅ Avantages de cette Structure

1. **Maintenabilité** : Fichiers courts et focalisés
2. **Testabilité** : Hooks et composants testables indépendamment
3. **Réutilisabilité** : Sections et hooks réutilisables
4. **Lisibilité** : Code clair et bien organisé
5. **Performance** : Possibilité d'optimiser chaque partie séparément

## 📝 Notes

- Le fichier principal fait maintenant **79 lignes** (vs 507 avant)
- Toute la logique métier est dans les hooks
- Les sections sont isolées et réutilisables
- La validation est centralisée et claire
- Le code respecte les conventions du projet (zéro `any`, types stricts)

## 🔄 Migration depuis l'Ancien Code

L'ancien fichier monolithique a été découpé en :
1. **3 hooks personnalisés** pour la logique
2. **2 composants** pour l'UI (sections + footer)
3. **Fichier principal** réduit à l'orchestration

Toute la **fonctionnalité existante est préservée**.

## 📊 Refactorisation de ClientSection (2026-02-07)

### Avant
- `ClientSection.tsx` : **584 lignes** ❌

### Après
Le fichier a été découpé en **7 fichiers modulaires** :

| Fichier | Lignes | Rôle |
|---------|--------|------|
| `ClientSection.tsx` | 136 | Orchestrateur principal |
| `useClientManagement.ts` | 239 | Logique métier (création/édition) |
| `ClientSearchInput.tsx` | 65 | Barre de recherche |
| `ClientSearchResults.tsx` | 60 | Liste des résultats |
| `ClientCreateForm.tsx` | 119 | Formulaire de création |
| `ClientEditForm.tsx` | 103 | Formulaire d'édition |
| `SelectedClientDisplay.tsx` | 80 | Affichage client sélectionné |
| **TOTAL** | **802** | *(découpage ajoute des interfaces)* |

### Fonctionnalités Préservées ✅
- Recherche de clients existants via cache
- Création client simple (sans compte)
- Création client avec compte + email d'activation
- Édition d'un client existant
- Affichage du client sélectionné avec badges
- Gestion complète du loading et des erreurs

### Flux de Données

```
ClientSection (orchestrateur)
  │
  ├─> useClientManagement (logique métier)
  │     ├─> handleCreateNewClient()
  │     ├─> handleEditClient()
  │     ├─> handleSaveEdit()
  │     └─> handleCancelEdit()
  │
  ├─> ClientSearchInput (recherche)
  ├─> ClientSearchResults (résultats)
  ├─> ClientCreateForm (création)
  ├─> ClientEditForm (édition)
  └─> SelectedClientDisplay (affichage)
```

### Conventions Respectées ✅
- Aucun fichier > 200 lignes
- Zéro types `any`
- Logique extraite dans un hook custom
- Composants présentationnels purs
- Props typées avec interfaces
- Type `ClientData` unifié et partagé avec `useClientsCache`

---

*Dernière mise à jour : 2026-02-07*
