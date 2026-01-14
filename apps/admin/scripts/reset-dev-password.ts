import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'coworking-admin';

async function resetDevPassword() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Generate new password hash
    const password = 'Dev@1234';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('🔐 Generated hash:', hashedPassword);

    // Verify the hash works
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('✓ Hash verification:', isValid ? 'PASS' : 'FAIL');

    // Update the user
    const result = await usersCollection.updateOne(
      { email: 'dev@coworkingcafe.fr' },
      {
        $set: {
          password: hashedPassword,
          role: 'dev',
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found, creating new user...');
      await usersCollection.insertOne({
        email: 'dev@coworkingcafe.fr',
        password: hashedPassword,
        role: 'dev',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ User created');
    } else {
      console.log('✅ Password updated');
    }

    // Verify the user in database
    const user = await usersCollection.findOne({ email: 'dev@coworkingcafe.fr' });
    if (user) {
      console.log('📄 User in database:', {
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });

      // Test password comparison
      const testMatch = await bcrypt.compare(password, user.password);
      console.log('🧪 Password comparison test:', testMatch ? 'PASS ✅' : 'FAIL ❌');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

resetDevPassword();
