#!/usr/bin/env node

/**
 * Script pour hasher un mot de passe avec bcrypt
 * Utile pour créer manuellement un admin dans MongoDB Compass
 *
 * Usage:
 *   node scripts/hash-password.js "VotreMotDePasse123"
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('❌ Usage: node scripts/hash-password.js "VotreMotDePasse"');
  process.exit(1);
}

async function hashPassword() {
  try {
    const hash = await bcrypt.hash(password, 10);

    console.log('\n✅ Mot de passe hashé avec succès !\n');
    console.log('📋 Hash bcrypt (à copier dans MongoDB):');
    console.log(hash);
    console.log('\n💾 Document admin à insérer dans MongoDB:\n');
    console.log(JSON.stringify({
      email: "votre-email@example.com",
      password: hash,
      givenName: "Prénom",
      role: "dev", // ou "admin" ou "staff"
      employeeId: null, // ou ObjectId("...") si lié à un employé
      createdAt: new Date(),
      updatedAt: new Date()
    }, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

hashPassword();
