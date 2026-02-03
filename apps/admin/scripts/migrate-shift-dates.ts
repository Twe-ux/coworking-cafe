/**
 * Migration Script: Convert Shift dates from Date objects to YYYY-MM-DD strings
 *
 * Problem: Old shifts have dates stored as Date objects, new shifts use strings
 * Solution: Convert all Date objects to YYYY-MM-DD format strings
 *
 * Usage:
 *   pnpm tsx scripts/migrate-shift-dates.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Shift from '../src/models/shift';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Format Date to YYYY-MM-DD string
function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function migrateShiftDates() {
  try {
    console.log('🔄 Starting Shift date migration...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all shifts with Date objects (not strings)
    const shifts = await Shift.find({}).lean();
    console.log(`📊 Total shifts found: ${shifts.length}\n`);

    let migratedCount = 0;
    let alreadyStringCount = 0;
    let errors = 0;

    for (const shift of shifts) {
      try {
        // Check if date is already a string
        if (typeof shift.date === 'string') {
          alreadyStringCount++;
          continue;
        }

        // Convert Date object to YYYY-MM-DD string
        const dateObj = shift.date as Date;
        const dateStr = formatDateToYMD(dateObj);

        // Update in database
        await Shift.updateOne(
          { _id: shift._id },
          { $set: { date: dateStr } }
        );

        migratedCount++;
        console.log(`  ✓ Migrated shift ${shift._id}: ${dateObj.toISOString()} → ${dateStr}`);
      } catch (error) {
        errors++;
        console.error(`  ✗ Error migrating shift ${shift._id}:`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Migrated:        ${migratedCount} shifts`);
    console.log(`ℹ️  Already strings: ${alreadyStringCount} shifts`);
    console.log(`❌ Errors:          ${errors} shifts`);
    console.log(`📊 Total:           ${shifts.length} shifts`);
    console.log('='.repeat(60) + '\n');

    if (errors === 0) {
      console.log('✨ Migration completed successfully!\n');
    } else {
      console.log('⚠️  Migration completed with errors. Please check logs above.\n');
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const verifyShifts = await Shift.find({}).lean();
    const allStrings = verifyShifts.every(s => typeof s.date === 'string');

    if (allStrings) {
      console.log('✅ Verification passed: All shift dates are now strings\n');
    } else {
      const remainingDates = verifyShifts.filter(s => typeof s.date !== 'string');
      console.log(`⚠️  Verification failed: ${remainingDates.length} shifts still have Date objects\n`);
      remainingDates.slice(0, 5).forEach(s => {
        console.log(`  - Shift ${s._id}: ${s.date}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateShiftDates();
