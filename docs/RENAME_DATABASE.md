# Renommer les Databases MongoDB Atlas

**Objectif** : Harmoniser les noms de databases entre dev et prod

---

## Situation Actuelle vs Cible

| Environnement | Ancien nom           | Nouveau nom      |
| ------------- | -------------------- | ---------------- |
| **Dev**       | `coworking_cafe_dev` | `coworking_cafe` |
| **Prod**      | `coworking_cafe`     | `coworking_cafe` |

---

## ⚠️ IMPORTANT

MongoDB Atlas **ne permet PAS de renommer une database**. Il faut :

1. Créer une nouvelle database avec le bon nom
2. Copier les données
3. Supprimer l'ancienne database

---

## Option A : Renommer via Script (Recommandé)

### 1. Script de Migration

```javascript
// scripts/rename-database.js
const { MongoClient } = require("mongodb");

async function renameDatabase(sourceDb, targetDb, uri) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`Connected to ${uri.split("@")[1].split("/")[0]}`);

    // Get source database
    const source = client.db(sourceDb);
    const target = client.db(targetDb);

    // Get all collections
    const collections = await source.listCollections().toArray();
    console.log(`Found ${collections.length} collections to copy`);

    // Copy each collection
    for (const coll of collections) {
      const collName = coll.name;
      console.log(`Copying collection: ${collName}...`);

      const sourceCollection = source.collection(collName);
      const targetCollection = target.collection(collName);

      // Copy documents
      const docs = await sourceCollection.find().toArray();
      if (docs.length > 0) {
        await targetCollection.insertMany(docs);
        console.log(`  ✅ Copied ${docs.length} documents`);
      } else {
        console.log(`  ⚠️  Collection empty`);
      }

      // Copy indexes
      const indexes = await sourceCollection.indexes();
      for (const index of indexes) {
        if (index.name !== "_id_") {
          await targetCollection.createIndex(index.key, {
            name: index.name,
            unique: index.unique || false,
          });
          console.log(`  ✅ Created index: ${index.name}`);
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log(`\n⚠️  Remember to:`);
    console.log(`  1. Update MONGODB_URI to use database: ${targetDb}`);
    console.log(`  2. Test the application`);
    console.log(`  3. Delete old database: ${sourceDb}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

// Usage
const OLD_DB = process.argv[2];
const NEW_DB = process.argv[3];
const URI = process.env.MONGODB_URI;

if (!OLD_DB || !NEW_DB || !URI) {
  console.log(
    'Usage: MONGODB_URI="..." node scripts/rename-database.js <old-db> <new-db>',
  );
  process.exit(1);
}

renameDatabase(OLD_DB, NEW_DB, URI);
```

### 2. Exécution - DEV

```bash
# Installer dépendances
cd scripts
npm install mongodb

# Renommer DEV
MONGODB_URI="mongodb+srv://dev-user:YOUR_PASSWORD@coworking-cafe-dev.lxjwvii.mongodb.net" \
node rename-database.js coworking_cafe_dev coworking_cafe
```

### 3. Exécution - PROD

```bash
# Renommer PROD (⚠️ Faire backup avant !)
MONGODB_URI="mongodb+srv://prod-user:YOUR_PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net" \
node rename-database.js coworking_cafe coworking_cafe
```

### 4. Mettre à jour les URIs

```bash
# apps/admin/.env.local
MONGODB_URI=mongodb+srv://dev-user:YOUR_PASSWORD@coworking-cafe-dev.lxjwvii.mongodb.net/coworking_cafe

# Vercel (prod)
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI production
# Coller: mongodb+srv://prod-user:YOUR_PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe
```

### 5. Tester

```bash
# Dev
cd apps/admin
pnpm dev
# Tester login, création de données

# Prod
# Tester sur https://admin.coworkingcafe.fr
```

### 6. Supprimer anciennes databases

**MongoDB Atlas** :

1. Cluster dev → Browse Collections → `coworking_cafe_dev` → Drop Database
2. Cluster prod → Browse Collections → `coworking_cafe` → Drop Database

---

## Option B : Copie Manuelle (MongoDB Compass)

Si vous préférez l'interface graphique :

### 1. Installer MongoDB Compass

https://www.mongodb.com/try/download/compass

### 2. Connecter au Cluster Dev

```
URI: mongodb+srv://dev-user:YOUR_PASSWORD@coworking-cafe-dev.lxjwvii.mongodb.net
```

### 3. Pour Chaque Collection

1. Ouvrir `coworking_cafe_dev` → Collection
2. Exporter en JSON :
   - `admins` → Export Collection → JSON
   - `users` → Export Collection → JSON
   - etc.

3. Créer database `coworking_cafe`

4. Importer les fichiers JSON :
   - `coworking_cafe` → Create Collection → Import → JSON

### 4. Répéter pour Prod

---

## ✅ Checklist Post-Migration

- [ ] Database `coworking_cafe` existe sur cluster dev
- [ ] Database `coworking_cafe` existe sur cluster prod
- [ ] Toutes les collections copiées
- [ ] Indexes recréés
- [ ] `.env.local` mis à jour
- [ ] Vercel env vars mis à jour
- [ ] Application testée (dev)
- [ ] Application testée (prod)
- [ ] Anciennes databases supprimées (`coworking_cafe_dev`, `coworking_cafe`)

---

**Temps estimé** : 30 min (dev) + 30 min (prod) = 1h
