# Problemes Connus

> Liste des problemes connus et de leur status.
> **Derniere mise a jour** : 2026-01-20

---

## Problemes Actifs

### 1. TypeScript `any` dans les routes API

**Severite** : Moyenne
**Fichiers concernes** : Routes API shifts, availabilities, accounting

**Description** :
Certaines routes utilisent `as any` pour les transformations Mongoose au lieu de types corrects.

**Exemple** :
```typescript
// Route actuelle
const transformedShift = {
  id: (shift as any)._id.toString(),
  // ...
}

// Devrait etre
const transformedShift = {
  id: shift._id.toString(),
  // ...
}
```

**Solution prevue** :
Creer des mappers types dans `/lib/mappers/mongoose.mappers.ts`

**Status** : En cours

---

### 2. Warnings Mongoose exports

**Severite** : Basse (warnings uniquement)
**Fichiers concernes** : `/models/shift/`, `/models/timeEntry/`

**Description** :
```
export 'IShift' was not found in './document'
export 'ITimeEntry' was not found in './document'
```

**Impact** : Aucun impact runtime, warnings au build

**Solution** : Verifier les exports dans les fichiers document.ts

**Status** : A investiguer

---

### 3. Build avec typescript.ignoreBuildErrors

**Severite** : Haute
**Fichier** : `next.config.js`

**Description** :
Le build est configure avec `typescript: { ignoreBuildErrors: true }` pour passer malgre certaines erreurs de types.

**Impact** : Les erreurs TypeScript ne bloquent pas le build

**Solution** :
1. Fixer tous les types locaux vs partages
2. Retirer l'option du next.config.js
3. Valider que le build passe sans erreurs

**Status** : A faire apres correction des types

---

## Problemes Resolus

Voir [BUGS.md](./BUGS.md) pour les bugs documentes et resolus.

---

## Signaler un Probleme

Pour ajouter un nouveau probleme :

1. Decrire le symptome
2. Identifier la cause si possible
3. Indiquer la severite (Haute/Moyenne/Basse)
4. Proposer une solution

---

*Derniere mise a jour : 2026-01-20*
