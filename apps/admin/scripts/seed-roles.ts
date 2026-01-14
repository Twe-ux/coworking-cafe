import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase, Role } from '@coworking-cafe/database';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local'), override: true });

/**
 * Seed roles in database
 * Creates the 3 system roles: dev, admin, staff
 */
async function seedRoles() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');

    const roles = [
      {
        name: 'Developer',
        slug: 'dev' as const,
        description: 'Developer role with full system access and debug tools',
        level: 100,
        isSystem: true,
      },
      {
        name: 'Administrator',
        slug: 'admin' as const,
        description: 'Administrator role with full management access',
        level: 80,
        isSystem: true,
      },
      {
        name: 'Staff',
        slug: 'staff' as const,
        description: 'Staff role with limited access to schedule and tasks',
        level: 50,
        isSystem: true,
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ slug: roleData.slug });

      if (!existingRole) {
        await Role.create(roleData);
        console.log(`✅ Created role: ${roleData.name} (${roleData.slug}) - Level ${roleData.level}`);
        createdCount++;
      } else {
        console.log(`ℹ️  Role already exists: ${roleData.name} (${roleData.slug})`);
        existingCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   - Created: ${createdCount} role(s)`);
    console.log(`   - Already existing: ${existingCount} role(s)`);
    console.log(`   - Total: ${roles.length} role(s)\n`);

    console.log('🎉 Roles seeding completed!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();
