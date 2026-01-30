#!/usr/bin/env node

/**
 * Script pour créer un compte admin dans la collection `admins`
 *
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js
 *
 * Architecture des collections:
 *   - `users` → Clients du site public
 *   - `employees` → Employés RH (planning, pointage)
 *   - `admins` → Comptes système (dev, admin, staff)
 *
 * Lien optionnel:
 *   Si l'admin est aussi un employé, on peut lier via `employeeId`
 */

const { MongoClient, ObjectId } = require('mongodb');
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

async function createAdmin() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    console.log('Usage: MONGODB_URI="mongodb+srv://..." node scripts/create-admin.js');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const adminsCollection = db.collection('admins');
    const employeesCollection = db.collection('employees');

    console.log('\n📝 Configuration du compte admin\n');

    // Demander les infos
    const email = await question('📧 Email: ');
    const password = await question('🔑 Mot de passe: ');
    const pin = await question('📱 PIN 6 chiffres: ');
    const givenName = await question('👤 Prénom: ');
    const roleChoice = await question('🎭 Rôle (dev/admin/staff) [admin]: ');

    const role = roleChoice.trim().toLowerCase() || 'admin';

    if (!['dev', 'admin', 'staff'].includes(role)) {
      console.error('❌ Rôle invalide. Doit être: dev, admin ou staff');
      process.exit(1);
    }

    // Valider le PIN
    if (!/^\d{6}$/.test(pin)) {
      console.error('❌ Le PIN doit contenir exactement 6 chiffres');
      process.exit(1);
    }

    // Vérifier si l'email existe déjà dans admins
    const existingAdmin = await adminsCollection.findOne({
      email: email.toLowerCase()
    });

    if (existingAdmin) {
      console.error(`❌ Un admin avec l'email ${email} existe déjà`);
      process.exit(1);
    }

    // Chercher si un employé existe avec cet email (lien optionnel)
    console.log(`\n🔍 Recherche d'un employé avec cet email...`);
    const employee = await employeesCollection.findOne({
      email: email.toLowerCase()
    });

    let employeeId = null;
    if (employee) {
      console.log(`✅ Employé trouvé: ${employee.firstName} ${employee.lastName}`);
      const linkEmployee = await question('🔗 Lier ce compte admin à cet employé ? (y/n) [y]: ');
      if (linkEmployee.trim().toLowerCase() !== 'n') {
        employeeId = employee._id;
        console.log(`✅ Le compte admin sera lié à l'employé (ID: ${employeeId})`);
      }
    } else {
      console.log('ℹ️  Aucun employé trouvé avec cet email');
    }

    // Hash le mot de passe et le PIN
    console.log('\n🔐 Hashing du mot de passe et du PIN...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPin = await bcrypt.hash(pin, 10);

    // Créer l'admin
    const newAdmin = {
      email: email.toLowerCase(),
      password: hashedPassword,
      dashboardPin: hashedPin, // PIN 6 chiffres hashé
      givenName,
      role, // dev, admin, ou staff (string direct, pas ObjectId)
      employeeId: employeeId ? new ObjectId(employeeId) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('\n💾 Création du compte admin...');
    const result = await adminsCollection.insertOne(newAdmin);

    console.log('\n✅ ✅ ✅ Compte admin créé avec succès ! ✅ ✅ ✅\n');
    console.log('📋 Détails du compte:');
    console.log(`   Collection: admins`);
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Email: ${email}`);
    console.log(`   Prénom: ${givenName}`);
    console.log(`   Rôle: ${role}`);
    console.log(`   Lié à employé: ${employeeId ? 'Oui (ID: ' + employeeId + ')' : 'Non'}`);
    console.log(`   Mot de passe: ${password}`);
    console.log(`   PIN: ${pin}`);
    console.log('\n⚠️  IMPORTANT: Notez ces informations dans un endroit sûr !');
    console.log('🔗 URL de connexion: https://admin.coworkingcafe.fr/login');
    console.log('📱 Connexion rapide: Utilisez le PIN à 6 chiffres\n');

    if (employeeId) {
      console.log('💡 Cet admin apparaîtra dans le planning car lié à un employé');
    } else {
      console.log('💡 Cet admin est un compte système pur (pas dans le planning)');
    }

  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    rl.close();
  }
}

// Exécuter le script
createAdmin().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
