#!/usr/bin/env node

/**
 * Script pour lister toutes les collections MongoDB
 * Usage: node scripts/list-collections.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function listCollections() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Lister toutes les collections
    const collections = await db.listCollections().toArray();

    console.log(`📊 Total collections: ${collections.length}\n`);
    console.log('Collections found:');
    console.log('─'.repeat(50));

    for (const collection of collections) {
      const collectionName = collection.name;
      const stats = await db.collection(collectionName).stats();

      console.log(`\n📁 ${collectionName}`);
      console.log(`   Documents: ${stats.count}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    }

    console.log('\n' + '─'.repeat(50));

    // Chercher spécifiquement drink_items
    const drinkItems = collections.find(c => c.name === 'drink_items');
    const menuItems = collections.find(c => c.name === 'menuitems');

    console.log('\n🔍 Vérification drink_items vs menuitems:');
    console.log(`   drink_items: ${drinkItems ? '✅ EXISTE' : '❌ N\'EXISTE PAS'}`);
    console.log(`   menuitems: ${menuItems ? '✅ EXISTE' : '❌ N\'EXISTE PAS'}`);

    if (drinkItems) {
      const count = await db.collection('drink_items').countDocuments();
      console.log(`\n⚠️  drink_items contient ${count} documents`);

      if (count > 0) {
        console.log('   → Collection obsolète à supprimer');
      } else {
        console.log('   → Collection vide, peut être supprimée');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

listCollections();
