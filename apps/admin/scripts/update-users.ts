import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, User } from '@coworking-cafe/database';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

async function updateUsers() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Update dev user
    const devUser = await User.findOne({ email: 'dev@coworkingcafe.fr' });
    if (devUser) {
      await User.updateOne(
        { email: 'dev@coworkingcafe.fr' },
        {
          $set: {
            username: 'dev',
            givenName: 'Developer'
          }
        }
      );
      console.log('✅ Dev user updated');
    }

    // Update admin user
    const adminUser = await User.findOne({ email: 'admin@coworkingcafe.fr' });
    if (adminUser) {
      await User.updateOne(
        { email: 'admin@coworkingcafe.fr' },
        {
          $set: {
            username: 'admin',
            givenName: 'Administrator'
          }
        }
      );
      console.log('✅ Admin user updated');
    }

    // Update staff user
    const staffUser = await User.findOne({ email: 'staff@coworkingcafe.fr' });
    if (staffUser) {
      await User.updateOne(
        { email: 'staff@coworkingcafe.fr' },
        {
          $set: {
            username: 'staff',
            givenName: 'Staff Member'
          }
        }
      );
      console.log('✅ Staff user updated');
    }

    console.log('\n🎉 All users updated!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

updateUsers();
