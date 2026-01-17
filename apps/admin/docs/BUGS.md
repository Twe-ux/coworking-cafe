# BUGS - Documentation des Bugs Résolus

> **Objectif** : Documenter les bugs rencontrés et leurs solutions pour éviter qu'ils se reproduisent.

---

## 1. Validation API - Rejet des Valeurs 0

**Date** : 2026-01-16
**Fichier** : `/app/api/promo/route.ts`
**Sévérité** : 🔴 Haute (empêchait la création de codes promo)

### Symptôme
L'API retournait **400 "Données manquantes"** lors de la soumission d'un formulaire avec `discountValue: 0` ou `maxUses: 0`.

**Erreur exacte** :
```
POST http://localhost:3001/api/promo 400 (Bad Request)
Error: Données manquantes
Champs requis: discountValue, maxUses
```

### Cause Racine
La validation utilisait l'opérateur `!` qui traite `0` comme une valeur falsy en JavaScript.

```typescript
// ❌ CODE PROBLÉMATIQUE (ligne 79)
const missingFields = requiredFields.filter((field) => !body[field])

// Problème : !0 === true, donc 0 est considéré comme "manquant"
```

**Valeurs falsy en JavaScript** :
- `false`
- `0`
- `""` (string vide)
- `null`
- `undefined`
- `NaN`

### Solution

**Séparer la validation des strings et des nombres** :

```typescript
// ✅ SOLUTION (lignes 77-82)

// 1. Vérifier les champs string (undefined, null ou vide)
const requiredFields: (keyof CreatePromoCodeRequest)[] = [
  'code',
  'token',
  'description',
  'discountType',
  'validFrom',
  'validUntil',
]

const missingFields = requiredFields.filter(
  (field) => body[field] == null || body[field] === ''
)

// 2. Vérifier les nombres séparément (peuvent être 0)
if (body.discountValue == null) missingFields.push('discountValue')
if (body.maxUses == null) missingFields.push('maxUses')

if (missingFields.length > 0) {
  return errorResponse(
    'Données manquantes',
    `Champs requis: ${missingFields.join(', ')}`,
    400
  )
}
```

### Prévention

**Pattern à adopter pour toutes les validations API** :

```typescript
// ❌ ÉVITER - Traite 0 comme invalide
if (!value) { ... }
if (!body.field) { ... }

// ✅ UTILISER - Vérifie null/undefined seulement
if (value == null) { ... }
if (body.field == null) { ... }

// ✅ ENCORE MIEUX - Séparer strings et numbers
// Strings : vérifier null/undefined + vide
if (stringField == null || stringField === '') { ... }

// Numbers : vérifier null/undefined seulement
if (numberField == null) { ... }
```

### Cas d'Usage Valides pour `0`

**Exemples où `0` est une valeur légitime** :
- `discountValue: 0` → Code promo sans réduction (offre gratuite)
- `maxUses: 0` → Utilisations illimitées
- `quantity: 0` → Stock épuisé
- `price: 0` → Article gratuit
- `score: 0` → Score nul valide
- `index: 0` → Premier élément d'un tableau

### Checklist de Review

Lors de la review de code API, vérifier :

- [ ] Les validations numériques ne rejettent pas `0`
- [ ] Utilisation de `== null` au lieu de `!variable`
- [ ] Séparation claire string/number dans la validation
- [ ] Tests avec valeurs limites (0, "", null, undefined)

---

## 2. Model Mongoose - Méthodes Non Disponibles

**Date** : 2026-01-16
**Fichier** : `/models/promoConfig/index.ts`
**Sévérité** : 🔴 Haute (empêchait toute opération utilisant les méthodes custom)

### Symptôme
L'API retournait **500 "promoConfig.archiveCurrentCode is not a function"** lors de la création d'un nouveau code promo.

**Erreur exacte** :
```
POST /api/promo error: TypeError: promoConfig.archiveCurrentCode is not a function
    at POST (webpack-internal:///(rsc)/./src/app/api/promo/route.ts:142:31)
```

### Cause Racine
Les méthodes Mongoose définies dans `methods.ts` n'étaient pas attachées au schema parce que le fichier n'était jamais importé dans `index.ts`.

**Pattern Mongoose** :
- Définir les méthodes : `EmployeeSchema.methods.myMethod = function() { ... }`
- Ce code doit être **exécuté** pour attacher les méthodes au schema
- Importer seulement l'interface ne suffit pas

```typescript
// ❌ CODE PROBLÉMATIQUE (index.ts ligne 4)
import { PromoConfigMethods } from './methods' // Importe seulement l'INTERFACE
import './virtuals' // Importe le fichier pour exécuter le code

// Problème : Le code de methods.ts n'est jamais exécuté
// donc les méthodes ne sont jamais attachées au schema
```

### Solution

**Importer le fichier `methods.ts` pour exécuter son code** :

```typescript
// ✅ SOLUTION (index.ts lignes 4-7)
import { PromoConfigMethods } from './methods' // Interface
import { VirtualPromoConfig } from './virtuals' // Interface
import './methods' // ⬅️ AJOUTÉ : Importe le fichier pour exécuter le code
import './virtuals' // Importe le fichier pour exécuter le code

// Maintenant, le code de methods.ts est exécuté et toutes les méthodes
// (incrementScan, archiveCurrentCode, etc.) sont attachées au schema
```

### Prévention

**Pattern à suivre pour tous les models Mongoose** :

```typescript
// Structure d'un model modulaire (5 fichiers)
/models/monModel/
├── index.ts        // Export + initialisation
├── document.ts     // Schema + Interface
├── methods.ts      // Méthodes d'instance
├── hooks.ts        // Pre/post hooks
└── virtuals.ts     // Propriétés virtuelles

// index.ts - TOUJOURS importer les fichiers pour exécuter le code
import { MyModelDocument, MyModelSchema } from './document'
import { MyModelMethods } from './methods'
import { VirtualMyModel } from './virtuals'
import './methods'   // ⬅️ OBLIGATOIRE
import './virtuals'  // ⬅️ OBLIGATOIRE si virtuals existent
import { attachHooks } from './hooks'

// Puis créer le model
attachHooks()
const MyModel = model<MyModelDocument, MyModelModelType>('MyModel', MyModelSchema)
```

### Checklist de Review

Lors de la création d'un nouveau model Mongoose :

- [ ] `methods.ts` définit les méthodes avec `Schema.methods.myMethod = ...`
- [ ] `index.ts` importe le fichier : `import './methods'`
- [ ] Si virtuals existent : `import './virtuals'`
- [ ] Si hooks existent : `import { attachHooks } from './hooks'` + `attachHooks()`
- [ ] Tester les méthodes custom avant de commit

**Symptômes d'oubli** :
- `TypeError: model.myMethod is not a function`
- Méthode définie mais introuvable à l'exécution
- Intellisense voit la méthode mais runtime échoue

---

## 3. [Réserver pour le prochain bug]

---

**Template pour documenter un nouveau bug** :

```markdown
## X. [Titre du Bug]

**Date** : YYYY-MM-DD
**Fichier** : `/chemin/vers/fichier.ts`
**Sévérité** : 🔴 Haute / 🟡 Moyenne / 🟢 Basse

### Symptôme
[Ce qui se passe visuellement/fonctionnellement]

### Cause Racine
[Explication technique du problème]

\`\`\`typescript
// ❌ CODE PROBLÉMATIQUE
[code qui causait le bug]
\`\`\`

### Solution

\`\`\`typescript
// ✅ SOLUTION
[code corrigé]
\`\`\`

### Prévention
[Comment éviter ce bug à l'avenir]

### Checklist de Review
- [ ] Point de vérification 1
- [ ] Point de vérification 2
```

---

**Dernière mise à jour** : 2026-01-16
