# Scripts de Migration

## migrate-dates-to-strings.ts

### Objectif
Convertir tous les champs de type `Date` vers `String` (format `YYYY-MM-DD`) pour éliminer les problèmes de timezone.

### Champs concernés
- **Employee**: `dateOfBirth`, `hireDate`, `endDate`
- **Shift**: `date`

### ⚠️ IMPORTANT - Avant d'exécuter

1. **Backup de la base de données**
   ```bash
   # Si MongoDB local
   mongodump --db coworking-cafe --out ./backup-$(date +%Y%m%d)

   # Si MongoDB Atlas (production)
   # Faire un snapshot depuis le dashboard Atlas
   ```

2. **Vérifier la connexion BD**
   - Le script utilise `MONGODB_URI` de `.env.local`
   - Assurez-vous de pointer vers la bonne base de données

### Exécution

```bash
# Depuis la racine de apps/admin
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe/apps/admin

# Exécuter le script
pnpm tsx scripts/migrate-dates-to-strings.ts
```

### Ce que fait le script

1. **Attend 5 secondes** au démarrage pour vous permettre d'annuler (Ctrl+C)
2. **Se connecte à MongoDB**
3. **Migre les Employees**:
   - Pour chaque employé, convertit `dateOfBirth`, `hireDate`, `endDate` de Date → String
   - Affiche les conversions effectuées
4. **Migre les Shifts**:
   - Pour chaque shift, convertit `date` de Date → String
   - Affiche les conversions effectuées
5. **Affiche un résumé**: nombre de documents migrés vs déjà au bon format

### Logs typiques

```
🚀 Démarrage de la migration Date → String

⚠️  ATTENTION: Assurez-vous d'avoir fait un backup de la BD avant de continuer !

Attente de 5 secondes pour vous permettre d'annuler (Ctrl+C)...

📡 Connexion à MongoDB...
✅ Connecté à MongoDB

📝 Migration des Employees...
  ✅ Migré: John Doe (dateOfBirth, hireDate)
  ✅ Migré: Jane Smith (dateOfBirth, hireDate, endDate)

📊 Employees: 12 migrés, 3 déjà au bon format

📝 Migration des Shifts...
  ✅ Migré shift: 507f1f77bcf86cd799439011 (2026-01-15T00:00:00.000Z → 2026-01-15)
  ✅ Migré shift: 507f1f77bcf86cd799439012 (2026-01-16T00:00:00.000Z → 2026-01-16)

📊 Shifts: 45 migrés, 0 déjà au bon format

✨ Migration terminée avec succès !

⚠️  Vérifiez que tout fonctionne correctement avant de supprimer votre backup.

👋 Déconnecté de MongoDB
```

### Après la migration

1. **Tester l'application**:
   ```bash
   pnpm dev
   ```

2. **Vérifier les fonctionnalités**:
   - Création d'employé (dates de naissance, embauche)
   - Planning (affichage des shifts)
   - Calendrier de disponibilités
   - Indisponibilités

3. **Si tout fonctionne**: Garder le backup pendant quelques jours, puis supprimer

4. **Si problème**: Restaurer le backup
   ```bash
   # MongoDB local
   mongorestore --db coworking-cafe ./backup-YYYYMMDD/coworking-cafe
   ```

### Idempotence

Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans problème.
- Si un champ est déjà au format `YYYY-MM-DD`, il ne sera pas modifié
- Seuls les champs de type `Date` seront convertis

### Rollback

Si vous devez annuler la migration :
```bash
# Restaurer depuis le backup
mongorestore --db coworking-cafe ./backup-YYYYMMDD/coworking-cafe
```

Puis revenir aux versions précédentes des models :
```bash
git checkout HEAD~1 -- src/models/employee/document.ts
git checkout HEAD~1 -- src/models/shift/document.ts
```
