#!/usr/bin/env node

/**
 * Script pour supprimer les collections comments, commentlikes et tags de MongoDB
 * Usage: node scripts/drop-comments-tags-collections.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function dropCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const collectionsToCheck = ['comments', 'commentlikes', 'tags'];
    let totalDropped = 0;

    for (const collectionName of collectionsToCheck) {
      // Vérifier si la collection existe
      const collections = await db.listCollections({ name: collectionName }).toArray();

      if (collections.length === 0) {
        console.log(`ℹ️  Collection "${collectionName}" n'existe pas. Ignorée.`);
        continue;
      }

      // Afficher le nombre de documents avant suppression
      const count = await db.collection(collectionName).countDocuments();
      console.log(`📊 Collection "${collectionName}" contient ${count} documents`);

      // Supprimer la collection
      await db.collection(collectionName).drop();
      console.log(`✅ Collection "${collectionName}" supprimée avec succès !`);
      totalDropped++;
    }

    console.log(`\n📋 RÉSUMÉ: ${totalDropped} collection(s) supprimée(s)`);

  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('ℹ️  Collection n\'existe pas. Rien à supprimer.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await client.close();
  }
}

dropCollections();
