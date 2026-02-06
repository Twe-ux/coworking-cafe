# Step 3 Availability - Module Documentation

Module refactorisé pour la gestion des disponibilités et répartition hebdomadaire des employés.

## 📊 Avant/Après

| Métrique | Avant | Après |
|----------|-------|-------|
| **Fichiers** | 1 fichier monolithique | 9 fichiers modulaires |
| **Lignes totales** | 412 lignes | 755 lignes (mieux organisé) |
| **Fichier principal** | 412 lignes | 123 lignes |
| **Max lignes/fichier** | 412 | 166 (useAvailabilityForm) |
| **Types `any`** | 0 (déjà propre) | 0 (maintenu) |

## 🏗️ Structure

```
step3-availability/
├── index.ts                      # Exports centralisés (19 lignes)
├── types.ts                      # Types et constants (67 lignes)
├── utils.ts                      # Utilitaires (55 lignes)
├── useAvailabilityForm.ts        # Hook logique métier (166 lignes)
├── TimeSlotInput.tsx             # Input créneau horaire (40 lignes)
├── DayAvailability.tsx           # Jour avec créneaux (78 lignes)
├── WeeklyDistributionTable.tsx   # Tableau répartition (84 lignes)
├── AvailabilityTab.tsx           # Onglet disponibilités (42 lignes)
└── DistributionTab.tsx           # Onglet répartition (81 lignes)
```

## 📦 Composants

### 1. `types.ts` - Types et constantes

Définit tous les types utilisés dans le module :
- `TimeSlotWithId` - Créneau avec ID unique
- `DayConfig` - Configuration d'un jour
- `UseAvailabilityFormProps` / `UseAvailabilityFormReturn` - Types du hook
- `DAYS` - Constante des jours de la semaine
- `WEEKS` - Constante des semaines (week1-4)

### 2. `utils.ts` - Fonctions utilitaires

Fonctions pures sans état :
- `generateSlotId()` - Génération d'ID unique
- `cleanAvailability()` - Nettoyage et tri des créneaux
- `addIdToSlot()` - Ajout d'ID à un créneau
- `createDefaultSlot()` - Création créneau par défaut (09:00-18:00)

### 3. `useAvailabilityForm.ts` - Hook de logique métier (166 lignes)

Hook custom qui gère toute la logique :
- État (availability, weeklyDistribution)
- Actions (toggleDay, addSlot, removeSlot, updateSlot)
- Calculs (totaux, validations)
- Retourne 13 valeurs/fonctions

**Pourquoi 166 lignes ?**
- Gère 2 états complexes
- 9 fonctions de manipulation
- Calculs et validations
- Déjà optimisé, difficile de découper davantage sans perte de cohérence

### 4. `TimeSlotInput.tsx` - Composant atomique (40 lignes)

Affiche un créneau horaire modifiable :
- 2 inputs time (start/end)
- Bouton suppression
- Props typées strictement

### 5. `DayAvailability.tsx` - Composant jour (78 lignes)

Gère un jour complet :
- Checkbox disponibilité
- Liste de créneaux (TimeSlotInput)
- Bouton ajout créneau
- Affichage conditionnel

### 6. `WeeklyDistributionTable.tsx` - Tableau (84 lignes)

Tableau de répartition hebdomadaire :
- 7 jours × 4 semaines = 28 cellules
- Inputs nombre d'heures
- Totaux par semaine
- Gestion jours non disponibles ("Repos")

### 7. `AvailabilityTab.tsx` - Onglet 1 (42 lignes)

Contenu de l'onglet "Disponibilités" :
- Itère sur tous les jours (DAYS)
- Affiche DayAvailability pour chaque jour
- Wrapper TabsContent

### 8. `DistributionTab.tsx` - Onglet 2 (81 lignes)

Contenu de l'onglet "Répartition hebdomadaire" :
- Description et instructions
- Tableau WeeklyDistributionTable
- Alert validation (total mensuel)
- Calcul heures contractuelles

### 9. `Step3Availability.tsx` - Orchestrateur (123 lignes)

Composant principal simplifié :
- Utilise le hook `useAvailabilityForm`
- Compose les onglets (AvailabilityTab + DistributionTab)
- Gère la soumission
- Affiche alertes de validation

## 🔄 Flux de Données

```
Step3Availability (orchestrateur)
      ↓
useAvailabilityForm (logique)
      ↓
AvailabilityTab / DistributionTab
      ↓
DayAvailability / WeeklyDistributionTable
      ↓
TimeSlotInput (atomique)
```

## 📐 Principes Appliqués

1. **Single Responsibility** - Chaque fichier a une responsabilité claire
2. **Composition** - Composants réutilisables assemblés
3. **Separation of Concerns** - Logique (hook) séparée de l'UI
4. **Type Safety** - Zero `any`, types explicites partout
5. **Props Typées** - Interfaces pour toutes les props
6. **Constantes Centralisées** - DAYS et WEEKS dans types.ts
7. **Utilitaires Purs** - Fonctions sans effets de bord

## 🚀 Import et Utilisation

```typescript
// Import du composant principal (inchangé)
import { Step3Availability } from '@/components/hr/onboarding/Step3Availability'

// Import des sous-composants (si réutilisation ailleurs)
import { DayAvailability, TimeSlotInput } from '@/components/hr/onboarding/step3-availability'

// Import du hook (si logique réutilisée)
import { useAvailabilityForm } from '@/components/hr/onboarding/step3-availability'
```

## ✅ Avantages

**Maintenabilité** :
- Facile de trouver où modifier (1 composant = 1 fichier)
- Pas de scroll infini dans un gros fichier
- Modifications isolées sans casser le reste

**Testabilité** :
- Chaque composant testable indépendamment
- Hook testable sans UI
- Utils testables comme fonctions pures

**Réutilisabilité** :
- TimeSlotInput réutilisable ailleurs
- DayAvailability réutilisable pour d'autres calendriers
- Hook réutilisable pour d'autres formulaires

**Performance** :
- Composants plus petits = re-renders optimisés
- Memoization plus facile si nécessaire

## 🔧 Maintenance

### Ajouter un nouveau jour
→ Modifier `DAYS` dans `types.ts`

### Changer la validation
→ Modifier `useAvailabilityForm.ts` (calculs)

### Modifier l'UI d'un créneau
→ Modifier `TimeSlotInput.tsx`

### Ajouter un champ au tableau
→ Modifier `WeeklyDistributionTable.tsx`

## 📝 Notes

- **Pas de breaking changes** - L'API publique de Step3Availability est identique
- **Compatibilité totale** - Fonctionne avec le OnboardingContext existant
- **Zero regression** - Même comportement, meilleure structure
- **Respect des conventions** - Suit CLAUDE.md (fichiers < 200 lignes, zero any)

---

**Refactorisé le** : 2026-01-20
**Par** : Claude Sonnet 4.5
**Objectif** : Rendre le code plus maintenable, testable et réutilisable
