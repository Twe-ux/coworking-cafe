#!/usr/bin/env node

/**
 * Script pour réinitialiser le mot de passe d'un admin
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/reset-admin-password.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    console.log('Usage: MONGODB_URI="mongodb+srv://..." node scripts/reset-admin-password.js');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db();
    const adminsCollection = db.collection('admins');

    // Demander l'email
    const email = await question('📧 Email de l\'admin: ');

    // Vérifier que l'admin existe
    const admin = await adminsCollection.findOne({
      email: email.toLowerCase()
    });

    if (!admin) {
      console.error(`\n❌ Aucun admin trouvé avec l'email: ${email}`);
      process.exit(1);
    }

    console.log(`\n✅ Admin trouvé: ${admin.givenName || admin.email}`);
    console.log(`   Rôle: ${admin.role}\n`);

    // Demander le nouveau mot de passe
    const newPassword = await question('🔑 Nouveau mot de passe: ');

    if (!newPassword || newPassword.length < 6) {
      console.error('\n❌ Le mot de passe doit contenir au moins 6 caractères');
      process.exit(1);
    }

    // Hash le nouveau mot de passe
    console.log('\n🔐 Hashing du mot de passe...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    console.log('💾 Mise à jour du mot de passe...');
    await adminsCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    console.log('\n✅ ✅ ✅ Mot de passe réinitialisé avec succès ! ✅ ✅ ✅\n');
    console.log('📋 Détails de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${newPassword}`);
    console.log(`\n🔗 URL de connexion: http://localhost:3001/login`);
    console.log('\n💡 Connectez-vous avec Email + Password, puis créez votre PIN\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    rl.close();
  }
}

resetPassword().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
