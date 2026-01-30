#!/usr/bin/env node

/**
 * Script non-interactif pour créer un compte admin
 *
 * Usage:
 *   MONGODB_URI="..." node scripts/create-admin-direct.js \
 *     --email dev@coworkingcafe.fr \
 *     --password YourPassword123 \
 *     --name Thierry \
 *     --role dev
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createAdmin() {
  // Parse arguments
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };

  const email = getArg('--email');
  const password = getArg('--password');
  const givenName = getArg('--name');
  const role = getArg('--role') || 'admin';
  const linkEmployee = getArg('--link-employee') === 'true';

  const uri = process.env.MONGODB_URI;

  // Validation
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  if (!email || !password || !givenName) {
    console.error('❌ Missing required arguments');
    console.log('\nUsage:');
    console.log('  MONGODB_URI="..." node scripts/create-admin-direct.js \\');
    console.log('    --email dev@coworkingcafe.fr \\');
    console.log('    --password YourPassword123 \\');
    console.log('    --name Thierry \\');
    console.log('    --role dev \\');
    console.log('    --link-employee true (optional)');
    process.exit(1);
  }

  if (!['dev', 'admin', 'staff'].includes(role)) {
    console.error('❌ Rôle invalide. Doit être: dev, admin ou staff');
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

    console.log('\n📝 Configuration du compte admin');
    console.log(`   Email: ${email}`);
    console.log(`   Prénom: ${givenName}`);
    console.log(`   Rôle: ${role}`);

    // Vérifier si l'email existe déjà dans admins
    const existingAdmin = await adminsCollection.findOne({
      email: email.toLowerCase()
    });

    if (existingAdmin) {
      console.error(`\n❌ Un admin avec l'email ${email} existe déjà`);
      process.exit(1);
    }

    // Chercher si un employé existe avec cet email
    let employeeId = null;
    if (linkEmployee) {
      console.log(`\n🔍 Recherche d'un employé avec cet email...`);
      const employee = await employeesCollection.findOne({
        email: email.toLowerCase()
      });

      if (employee) {
        employeeId = employee._id;
        console.log(`✅ Employé trouvé: ${employee.firstName} ${employee.lastName}`);
        console.log(`✅ Le compte admin sera lié à l'employé (ID: ${employeeId})`);
      } else {
        console.log('ℹ️  Aucun employé trouvé avec cet email');
      }
    }

    // Hash le mot de passe
    console.log('\n🔐 Hashing du mot de passe...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    const newAdmin = {
      email: email.toLowerCase(),
      password: hashedPassword,
      givenName,
      role,
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
    console.log('\n⚠️  IMPORTANT: Notez ces informations dans un endroit sûr !');
    console.log('🔗 URL de connexion: https://admin.coworkingcafe.fr/login\n');

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
  }
}

// Exécuter le script
createAdmin().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
