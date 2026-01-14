import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, User, Role } from '@coworking-cafe/database';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

async function createAdmin() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Create or get dev role
    let devRole = await Role.findOne({ slug: 'dev' });
    if (!devRole) {
      devRole = await Role.create({
        name: 'Developer',
        slug: 'dev',
        description: 'Developer role with full access',
        level: 100,
        isSystem: true,
      });
      console.log('Dev role created');
    }

    // Create or get admin role
    let adminRole = await Role.findOne({ slug: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Administrator',
        slug: 'admin',
        description: 'Administrator role with full access',
        level: 80,
        isSystem: true,
      });
      console.log('Admin role created');
    }

    // Create or get staff role
    let staffRole = await Role.findOne({ slug: 'staff' });
    if (!staffRole) {
      staffRole = await Role.create({
        name: 'Staff',
        slug: 'staff',
        description: 'Staff role with limited access',
        level: 50,
        isSystem: true,
      });
      console.log('Staff role created');
    }

    // Create dev user
    const existingDev = await User.findOne({ email: 'dev@coworkingcafe.fr' });
    if (!existingDev) {
      await User.create({
        email: 'dev@coworkingcafe.fr',
        password: 'Dev@1234',
        username: 'dev',
        givenName: 'Developer',
        role: devRole._id,
        newsletter: false,
        isTemporary: false,
      });
      console.log('✅ Dev user created!');
      console.log('Email: dev@coworkingcafe.fr');
      console.log('Password: Dev@1234');
      console.log('Access: 100%\n');
    } else {
      console.log('ℹ️  Dev user already exists');
    }

    // Create admin user
    const existingAdmin = await User.findOne({ email: 'admin@coworkingcafe.fr' });
    if (!existingAdmin) {
      await User.create({
        email: 'admin@coworkingcafe.fr',
        password: 'Admin@1234',
        username: 'admin',
        givenName: 'Administrator',
        role: adminRole._id,
        newsletter: false,
        isTemporary: false,
      });
      console.log('✅ Admin user created!');
      console.log('Email: admin@coworkingcafe.fr');
      console.log('Password: Admin@1234');
      console.log('Access: 80%\n');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create staff user
    const existingStaff = await User.findOne({ email: 'staff@coworkingcafe.fr' });
    if (!existingStaff) {
      await User.create({
        email: 'staff@coworkingcafe.fr',
        password: 'Staff@1234',
        username: 'staff',
        givenName: 'Staff Member',
        role: staffRole._id,
        newsletter: false,
        isTemporary: false,
      });
      console.log('✅ Staff user created!');
      console.log('Email: staff@coworkingcafe.fr');
      console.log('Password: Staff@1234');
      console.log('Access: 50%\n');
    } else {
      console.log('ℹ️  Staff user already exists');
    }

    console.log('\n🎉 All users are ready!');
    console.log('You can now login at http://localhost:3001/login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
