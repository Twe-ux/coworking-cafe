# 🔄 Migration des Dates des Shifts

## Problème Identifié

Dans la base de données MongoDB, les **shifts** ont des dates stockées dans **deux formats différents** :

### 1. Format ancien (Date objects) ❌
```json
{
  "date": {
    "$date": "2026-02-01T00:00:00.000Z"
  }
}
```

### 2. Format récent (Strings) ✅
```json
{
  "date": "2026-03-15"
}
```

## Impact

Ce mélange de formats cause des **problèmes de filtrage** dans l'API :
- ✅ Les shifts avec dates en **string** s'affichent correctement
- ❌ Les shifts avec dates en **Date object** ne passent pas les filtres `$gte` / `$lte`
- 🐛 Résultat : **Seuls les 3 derniers shifts** (format string) s'affichent dans le planning

## Solution

Le script `migrate-shift-dates.ts` convertit **toutes les dates** au format string `YYYY-MM-DD`.

## Exécution

### Prérequis
- ✅ Fichier `.env.local` avec `MONGODB_URI` configuré
- ✅ Connexion à la base de données MongoDB

### Commande
```bash
# Dans /apps/admin/
pnpm migrate-shift-dates
```

### Ce que fait le script
1. 📊 Récupère tous les shifts de la base
2. 🔍 Identifie ceux avec des dates en format Date
3. 🔄 Convertit les dates : `Date("2026-02-01T00:00:00.000Z")` → `"2026-02-01"`
4. 💾 Met à jour la base de données
5. ✅ Vérifie que toutes les dates sont maintenant des strings

### Résultat Attendu
```
🔄 Starting Shift date migration...

✅ Connected to MongoDB

📊 Total shifts found: 38

  ✓ Migrated shift 697e2a93c2ee313d4f878dbd: 2026-02-01T00:00:00.000Z → 2026-02-01
  ✓ Migrated shift 697e2aaaadfcbd7f7dff5050: 2026-02-01T00:00:00.000Z → 2026-02-01
  ...

============================================================
📈 Migration Summary:
============================================================
✅ Migrated:        35 shifts
ℹ️  Already strings: 3 shifts
❌ Errors:          0 shifts
📊 Total:           38 shifts
============================================================

✨ Migration completed successfully!

🔍 Verifying migration...
✅ Verification passed: All shift dates are now strings

👋 Disconnected from MongoDB
```

## Après Migration

1. ✅ Tous les shifts seront au format string `YYYY-MM-DD`
2. ✅ Les filtres par date fonctionneront correctement
3. ✅ Tous les shifts s'afficheront dans le planning
4. ✅ Plus de problème d'apparition/disparition aléatoire

## Rollback (Si Nécessaire)

Si tu veux revenir en arrière, tu peux restaurer depuis un backup MongoDB :
```bash
mongorestore --uri="MONGODB_URI" --nsInclude="coworking_cafe.shifts" backup/
```

**⚠️ Important** : Fais un backup avant d'exécuter la migration !

```bash
# Backup de la collection shifts
mongodump --uri="MONGODB_URI" --collection=shifts --db=coworking_cafe --out=backup/
```

---

**Date** : 2026-02-03
**Auteur** : Claude + Thierry
