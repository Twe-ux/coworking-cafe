import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, User, Role } from '@coworking-cafe/database';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

async function debugDatabase() {
  try {
    console.log('🔍 Debugging database connection...\n');

    const mongoose = await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    console.log('\n---\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Collections in database:');
    collections.forEach((col) => {
      console.log(`  - ${col.name}`);
    });
    console.log('\n---\n');

    // Count documents
    const roleCount = await Role.countDocuments();
    const userCount = await User.countDocuments();

    console.log(`📊 Document counts:`);
    console.log(`  - Roles: ${roleCount}`);
    console.log(`  - Users: ${userCount}`);
    console.log('\n---\n');

    // List roles
    if (roleCount > 0) {
      const roles = await Role.find();
      console.log('👥 Roles:');
      roles.forEach((role) => {
        console.log(`  - ${role.name} (${role.slug}) - Level: ${role.level}`);
      });
      console.log('\n---\n');
    }

    // List users
    if (userCount > 0) {
      const users = await User.find().populate('role');
      console.log('👤 Users:');
      users.forEach((user) => {
        console.log(`  - ${user.email} (${user.role?.name || 'No role'})`);
      });
    } else {
      console.log('⚠️  No users found in database');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugDatabase();
