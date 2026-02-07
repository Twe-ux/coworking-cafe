/**
 * Script to seed test users for each role
 * Run with: npm run seed:users
 * Or directly: npx tsx src/lib/seed-users.ts
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

import connectDB from './mongodb';
import { createUser, initializeRoles } from './auth-helpers';

async function seedUsers() {
  try {
    await connectDB();
    // Initialize roles first
    await initializeRoles();
    // Create test users for each role
    const testUsers = [
      {
        email: 'dev@coworkingcafe.fr',
        password: 'dev123456',
        givenName: 'Dev User',
        username: 'dev_user',
        roleSlug: 'dev' as const,
      },
      {
        email: 'admin@coworkingcafe.fr',
        password: 'admin123456',
        givenName: 'Admin User',
        username: 'admin_user',
        roleSlug: 'admin' as const,
      },
      {
        email: 'staff@coworkingcafe.fr',
        password: 'staff123456',
        givenName: 'Staff User',
        username: 'staff_user',
        roleSlug: 'staff' as const,
      },
      {
        email: 'client@coworkingcafe.fr',
        password: 'client123456',
        givenName: 'Client User',
        username: 'client_user',
        roleSlug: 'client' as const,
      },
    ];

    for (const userData of testUsers) {
      try {
        const user = await createUser(userData);
        // User created successfully
      } catch (error: unknown) {
        if (error instanceof Error && error.message?.includes('already exists')) {
          // User already exists
        } else {
          // Error creating user
        }
      }
    }
    testUsers.forEach((user) => {
      // Process user
    });
    process.exit(0);
  } catch (error) {
    // Error seeding users
    process.exit(1);
  }
}

seedUsers();
