#!/usr/bin/env node

/**
 * Script pour initialiser la database de développement
 *
 * Usage:
 *   MONGODB_URI_DEV="mongodb+srv://dev:password@dev-cluster..." node scripts/setup-dev-database.js
 *
 * Ce script :
 * 1. Crée les collections nécessaires dans coworking_cafe_dev
 * 2. Crée un compte admin de test
 * 3. Crée des données de test (optionnel)
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

const DEV_DB = 'coworking_cafe_dev';

async function setupDevDatabase() {
  const uri = process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI_DEV environment variable is required');
    console.log('Usage: MONGODB_URI_DEV="mongodb+srv://..." node scripts/setup-dev-database.js');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DEV_DB);

    console.log(`\n📦 Setting up development database: ${DEV_DB}\n`);

    // 1. Créer la collection admins
    console.log('1️⃣  Creating admins collection...');
    const adminsCollection = db.collection('admins');

    // Vérifier si un admin existe déjà
    const existingAdmin = await adminsCollection.findOne({ email: 'dev@coworkingcafe.fr' });

    if (existingAdmin) {
      console.log('   ℹ️  Admin dev@coworkingcafe.fr already exists');
    } else {
      // Créer un admin de test
      const hashedPassword = await bcrypt.hash('dev123', 10);
      await adminsCollection.insertOne({
        email: 'dev@coworkingcafe.fr',
        password: hashedPassword,
        givenName: 'Dev',
        role: 'dev',
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('   ✅ Admin created: dev@coworkingcafe.fr / dev123');
    }

    // 2. Créer les collections de base
    console.log('\n2️⃣  Creating base collections...');

    const collections = [
      'users',
      'employees',
      'roles',
      'shifts',
      'timeEntries',
      'availabilities',
      'bookings',
      'spaces',
      'cashEntries'
    ];

    for (const collName of collections) {
      const exists = await db.listCollections({ name: collName }).hasNext();
      if (!exists) {
        await db.createCollection(collName);
        console.log(`   ✅ Collection "${collName}" created`);
      } else {
        console.log(`   ℹ️  Collection "${collName}" already exists`);
      }
    }

    // 3. Créer des données de test (optionnel)
    console.log('\n3️⃣  Creating test data (optional)...');

    // Créer un rôle client
    const rolesCollection = db.collection('roles');
    const clientRole = await rolesCollection.findOne({ slug: 'client' });

    if (!clientRole) {
      await rolesCollection.insertOne({
        name: 'Client',
        slug: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('   ✅ Role "client" created');
    }

    // Créer un employé de test
    const employeesCollection = db.collection('employees');
    const testEmployee = await employeesCollection.findOne({ email: 'test.employee@example.com' });

    if (!testEmployee) {
      await employeesCollection.insertOne({
        firstName: 'Test',
        lastName: 'Employee',
        email: 'test.employee@example.com',
        phone: '+33612345678',
        dateOfBirth: '1990-01-01',
        placeOfBirth: 'Paris',
        address: {
          street: '1 Rue Test',
          postalCode: '75001',
          city: 'Paris'
        },
        contractType: 'CDI',
        contractualHours: 35,
        hireDate: '2024-01-01',
        employeeRole: 'Employé polyvalent',
        isActive: true,
        isDraft: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('   ✅ Test employee created: test.employee@example.com');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ ✅ ✅ Development database setup complete! ✅ ✅ ✅\n');
    console.log('📋 Summary:');
    console.log(`   Database: ${DEV_DB}`);
    console.log(`   Admin: dev@coworkingcafe.fr / dev123`);
    console.log(`   Collections: ${collections.length} created`);
    console.log('\n🔗 Next steps:');
    console.log('   1. Update apps/admin/.env.local with DEV URI');
    console.log('   2. Start dev server: cd apps/admin && pnpm dev');
    console.log('   3. Login: http://localhost:3001/login');
    console.log('      Email: dev@coworkingcafe.fr');
    console.log('      Password: dev123\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Exécuter le script
setupDevDatabase().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
