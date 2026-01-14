import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, User, Role } from '@coworking-cafe/database';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

async function resetUsers() {
  try {
    console.log('🔄 Resetting users...\n');

    await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Delete all users
    const deletedUsers = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} users`);

    // Delete all roles
    const deletedRoles = await Role.deleteMany({});
    console.log(`🗑️  Deleted ${deletedRoles.deletedCount} roles\n`);

    console.log('✅ Database cleaned! Run "pnpm create-admin" to create new users.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetUsers();
