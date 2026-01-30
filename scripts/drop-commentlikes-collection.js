#!/usr/bin/env node

/**
 * Script pour supprimer la collection commentlikes de MongoDB
 * Usage: node scripts/drop-commentlikes-collection.js
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function dropCommentLikesCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();

    // Vérifier si la collection existe
    const collections = await db.listCollections({ name: 'commentlikes' }).toArray();

    if (collections.length === 0) {
      console.log('ℹ️  Collection "commentlikes" n\'existe pas. Rien à supprimer.');
      return;
    }

    // Afficher le nombre de documents avant suppression
    const count = await db.collection('commentlikes').countDocuments();
    console.log(`📊 Collection "commentlikes" contient ${count} documents`);

    // Demander confirmation (simulation - suppression directe en mode script)
    console.log('\n⚠️  Suppression de la collection "commentlikes"...\n');

    // Supprimer la collection
    await db.collection('commentlikes').drop();

    console.log('✅ Collection "commentlikes" supprimée avec succès !');

  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('ℹ️  Collection "commentlikes" n\'existe pas. Rien à supprimer.');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await client.close();
  }
}

dropCommentLikesCollection();
