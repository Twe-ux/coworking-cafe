# Tests de Correction des Dates - Formulaires Employés

## Problème Corrigé

Les dates étaient envoyées en format Date JavaScript au lieu de strings "YYYY-MM-DD", causant des erreurs dans MongoDB.

### Exemple du problème (AVANT):
```json
{
  "dateOfBirth": "Mon Feb 14 2005 01:00:00 GMT+0100",
  "hireDate": "Sun Feb 01 2026 01:00:00 GMT+0100"
}
```

### Format correct (APRÈS):
```json
{
  "dateOfBirth": "2005-02-14",
  "hireDate": "2026-02-01"
}
```

## Fichiers Modifiés

### 1. Nouveau Composant DatePicker
- **Fichier**: `/src/components/ui/date-picker.tsx`
- **Description**: Composant réutilisable avec Calendar + Popover
- **Fonctionnalité**: Retourne toujours une string au format "YYYY-MM-DD"

### 2. Formulaire Création Employé
- **Fichier**: `/src/components/employee-scheduling/create-modal/ProfessionalInfoSection.tsx`
- **Changement**: Remplacé `<Input type="date">` par `<DatePicker>`
- **Champ concerné**: `startDate`

### 3. Formulaire Onboarding Étape 1
- **Fichier**: `/src/components/hr/onboarding/Step1PersonalInfo.tsx`
- **Changement**: Remplacé `<Input type="date">` par `<DatePicker>` avec `Controller`
- **Champ concerné**: `dateOfBirth`

### 4. Formulaire Onboarding Étape 2
- **Fichier**: `/src/components/hr/onboarding/Step2ContractInfo.tsx`
- **Changements**: Remplacé `<Input type="date">` par `<DatePicker>` avec `Controller`
- **Champs concernés**: `hireDate`, `endDate` (pour CDD)

### 5. Formulaire Édition Employé
- **Fichier**: `/src/components/employee-scheduling/edit-modal/StartDateSection.tsx`
- **Changement**: Remplacé `<Input type="date">` par `<DatePicker>`
- **Champ concerné**: `startDate`

### 6. API Création Employé
- **Fichier**: `/src/app/api/hr/employees/route.ts`
- **Changement**: Supprimé `new Date()` - garde les strings
- **Lignes**: 218 (dateOfBirth), 225 (hireDate), 227 (endDate)

### 7. API Mise à Jour Employé
- **Fichier**: `/src/app/api/hr/employees/[id]/route.ts`
- **Changement**: Supprimé `new Date()` - garde les strings
- **Lignes**: 194 (dateOfBirth), 203 (hireDate), 205 (endDate)

### 8. API Brouillon Employé
- **Fichier**: `/src/app/api/hr/employees/draft/route.ts`
- **Changement**: Supprimé `new Date()` - garde les strings
- **Lignes**: 133 (dateOfBirth), 141 (hireDate), 143 (endDate)

## Validation Model

Le model Mongoose est déjà configuré correctement:

```typescript
// /src/models/employee/document.ts
dateOfBirth: {
  type: String,
  required: [true, 'La date de naissance est requise'],
  match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
},
hireDate: {
  type: String,
  required: [true, "La date d'embauche est requise"],
  match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
},
```

## Comment Tester

### 1. Formulaire de Création d'Employé (Scheduling)
1. Aller sur `/admin/hr/employees`
2. Cliquer "Ajouter un employé"
3. Remplir le formulaire et sélectionner une date de début via le DatePicker
4. Soumettre
5. **Vérifier dans MongoDB**: Le champ `startDate` doit être "YYYY-MM-DD"

### 2. Onboarding Employé (Step 1)
1. Aller sur `/admin/hr/employees/new`
2. Remplir Step 1 et sélectionner une date de naissance via le DatePicker
3. Cliquer "Suivant"
4. **Vérifier dans le payload**: `dateOfBirth` doit être "YYYY-MM-DD"

### 3. Onboarding Employé (Step 2)
1. Après Step 1, remplir Step 2
2. Sélectionner une date d'embauche via le DatePicker
3. Si CDD: sélectionner une date de fin
4. Cliquer "Suivant"
5. **Vérifier dans le payload**: `hireDate` et `endDate` (si CDD) doivent être "YYYY-MM-DD"

### 4. Édition d'un Employé
1. Aller sur la liste des employés
2. Modifier un employé
3. Changer la date de début via le DatePicker
4. Sauvegarder
5. **Vérifier dans MongoDB**: Le champ `startDate` doit être "YYYY-MM-DD"

## Vérification MongoDB

### Avant (incorrect):
```javascript
db.employees.findOne({ _id: ObjectId("...") })
// Résultat:
{
  dateOfBirth: "Mon Feb 14 2005 01:00:00 GMT+0100",
  hireDate: "Sun Feb 01 2026 01:00:00 GMT+0100"
}
```

### Après (correct):
```javascript
db.employees.findOne({ _id: ObjectId("...") })
// Résultat:
{
  dateOfBirth: "2005-02-14",
  hireDate: "2026-02-01"
}
```

## Conventions Respectées

✅ **CLAUDE.md**: Dates en format string "YYYY-MM-DD"
✅ **TypeScript**: Pas de `any` types
✅ **Composants réutilisables**: DatePicker utilisable partout
✅ **Date-fns**: Pour formater l'affichage (déjà installé)
✅ **Locale française**: Calendar en français avec `date-fns/locale`

## Autres Fichiers avec `type="date"` (Non Modifiés)

Les fichiers suivants contiennent encore des `<Input type="date">` mais concernent d'autres modules:
- `/app/admin/settings/hours/HoursSettingsClient.tsx`
- `/app/admin/booking/reservations/...`
- `/components/clocking/TimeEntriesList/...`
- `/components/hr/unavailability/...`
- `/components/hr/modals/EndContractModal.tsx`
- `/components/hr/onboarding/Step4Administrative.tsx`
- `/components/staff/RequestUnavailabilityModal.tsx`
- `/components/promo/PromoCreateForm.tsx`

Ces fichiers peuvent être migrés progressivement vers le DatePicker en suivant le même pattern.

## Résumé des Changements

| Type de Changement | Nombre de Fichiers |
|-------------------|-------------------|
| Nouveau composant | 1 (DatePicker) |
| Formulaires React | 4 (ProfessionalInfo, Step1, Step2, StartDate) |
| Routes API | 3 (route.ts, [id]/route.ts, draft/route.ts) |
| **Total** | **8 fichiers** |

## Statut

✅ **Corrections appliquées**
🔄 **Tests requis** (voir section "Comment Tester")
📝 **Documentation mise à jour**
