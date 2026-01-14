import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'coworking-admin';

const users = [
  { email: 'dev@coworkingcafe.fr', password: 'Dev@1234', role: 'dev' },
  { email: 'admin@coworkingcafe.fr', password: 'Admin@123', role: 'admin' },
  { email: 'staff@coworkingcafe.fr', password: 'Staff@123', role: 'staff' },
];

async function createUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Delete all existing users
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing users`);

    // Create new users
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Verify hash immediately
      const isValid = await bcrypt.compare(userData.password, hashedPassword);

      console.log(`\n📝 Creating user: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Hash: ${hashedPassword}`);
      console.log(`   Verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

      await usersCollection.insertOne({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('\n✅ All users created successfully\n');

    // Verify all users
    console.log('🧪 Verifying all users in database:');
    const allUsers = await usersCollection.find({}).toArray();

    for (const dbUser of allUsers) {
      const originalUser = users.find(u => u.email === dbUser.email);
      if (originalUser) {
        const testMatch = await bcrypt.compare(originalUser.password, dbUser.password);
        console.log(`   ${dbUser.email}: ${testMatch ? '✅ PASS' : '❌ FAIL'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

createUsers();
