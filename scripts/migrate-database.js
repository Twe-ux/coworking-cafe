#!/usr/bin/env node

/**
 * Script de migration : coworking-admin → coworking_cafe_prod
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/migrate-database.js
 *
 * Ce script copie toutes les collections de coworking-admin vers coworking_cafe_prod
 */

const { MongoClient } = require('mongodb');

const SOURCE_DB = 'coworking-admin';
const TARGET_DB = 'coworking_cafe_prod';

// Collections à migrer (toutes sauf celles déjà dans target)
const COLLECTIONS_TO_MIGRATE = [
  'users',
  'roles',
  'employees',
  'shifts',
  'timeEntries',
  'bookings',
  'payments',
  'spaces',
  'tariffs',
  'sessions',
  'cashEntries',
  'availabilities',
  'conversations',
  'messages',
  'articles',
  'categories',
  'comments',
  'newsletters',
  'contactMails',
  'menuCategories',
  'menuItems',
  'promoConfigs',
  'globalHours',
  'spaceConfigurations',
  'additionalServices'
];

async function migrateDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    console.log('Usage: MONGODB_URI="mongodb+srv://..." node scripts/migrate-database.js');
    process.exit(1);
  }

  // Remplacer le nom de DB dans l'URI par source pour connexion
  const sourceUri = uri.replace(/\/[^\/]*\?/, `/${SOURCE_DB}?`);

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // Lister les databases disponibles
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();

    console.log('\n📊 Databases disponibles:');
    databases.forEach(db => {
      console.log(`   - ${db.name}`);
    });

    // Vérifier que source existe
    const sourceExists = databases.some(db => db.name === SOURCE_DB);
    if (!sourceExists) {
      console.error(`\n❌ Database source "${SOURCE_DB}" non trouvée`);
      console.log('Vérifiez le nom de la database source dans le script.');
      process.exit(1);
    }

    console.log(`\n🔄 Migration: ${SOURCE_DB} → ${TARGET_DB}\n`);

    // Se connecter aux deux databases
    const sourceDb = client.db(SOURCE_DB);
    const targetDb = client.db(TARGET_DB);

    // Lister les collections de la source
    const collections = await sourceDb.listCollections().toArray();
    console.log(`📦 ${collections.length} collections trouvées dans ${SOURCE_DB}:\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const collInfo of collections) {
      const collectionName = collInfo.name;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`⏭️  Skipping system collection: ${collectionName}`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`\n📋 Migration de "${collectionName}"...`);

        const sourceCollection = sourceDb.collection(collectionName);
        const targetCollection = targetDb.collection(collectionName);

        // Compter les documents
        const sourceCount = await sourceCollection.countDocuments();
        console.log(`   Source: ${sourceCount} documents`);

        if (sourceCount === 0) {
          console.log(`   ⏭️  Collection vide, skip`);
          skippedCount++;
          continue;
        }

        // Vérifier si la collection existe déjà dans target
        const targetCount = await targetCollection.countDocuments();
        if (targetCount > 0) {
          console.log(`   ⚠️  Target existe déjà (${targetCount} documents)`);
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });

          const answer = await new Promise(resolve => {
            rl.question(`   Écraser ? (y/n) [n]: `, resolve);
          });
          rl.close();

          if (answer.toLowerCase() !== 'y') {
            console.log(`   ⏭️  Skip`);
            skippedCount++;
            continue;
          }

          // Supprimer la collection existante
          await targetCollection.deleteMany({});
          console.log(`   🗑️  Collection target nettoyée`);
        }

        // Copier tous les documents
        const documents = await sourceCollection.find().toArray();
        if (documents.length > 0) {
          await targetCollection.insertMany(documents);
          console.log(`   ✅ ${documents.length} documents migrés`);
          migratedCount++;
        }

        // Copier les index
        const indexes = await sourceCollection.indexes();
        if (indexes.length > 1) { // > 1 car _id_ est toujours présent
          console.log(`   📑 ${indexes.length - 1} index à copier...`);
          for (const index of indexes) {
            if (index.name === '_id_') continue; // Skip _id index

            try {
              const indexSpec = { ...index.key };
              const indexOptions = {
                name: index.name,
                unique: index.unique || false,
                sparse: index.sparse || false,
              };

              await targetCollection.createIndex(indexSpec, indexOptions);
              console.log(`      ✅ Index "${index.name}" créé`);
            } catch (err) {
              console.log(`      ⚠️  Index "${index.name}" existe déjà`);
            }
          }
        }

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📊 Résumé de la migration:');
    console.log(`   ✅ Collections migrées: ${migratedCount}`);
    console.log(`   ⏭️  Collections skippées: ${skippedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log('\n✅ ✅ ✅ Migration terminée ! ✅ ✅ ✅\n');

    console.log('🔍 Vérification dans MongoDB Compass:');
    console.log(`   1. Ouvrir la database "${TARGET_DB}"`);
    console.log(`   2. Vérifier que toutes les collections sont présentes`);
    console.log(`   3. Vérifier le nombre de documents dans chaque collection\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter le script
migrateDatabase().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
