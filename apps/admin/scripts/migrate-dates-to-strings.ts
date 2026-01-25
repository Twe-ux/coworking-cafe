/**
 * Script de migration BD : Date → String
 *
 * Convertit tous les champs date de type Date vers String (YYYY-MM-DD)
 * - Employee: dateOfBirth, hireDate, endDate
 * - Shift: date
 *
 * IMPORTANT: Faire un backup de la BD avant d'exécuter ce script !
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { connectMongoose } from '../src/lib/mongodb';

/**
 * Format Date to YYYY-MM-DD string (UTC)
 */
function dateToString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function migrateEmployees() {
  console.log('\n📝 Migration des Employees...');

  const Employee = mongoose.connection.collection('employees');
  const employees = await Employee.find({}).toArray();

  let migrated = 0;
  let skipped = 0;

  for (const emp of employees) {
    const updates: Record<string, string> = {};

    // dateOfBirth
    if (emp.dateOfBirth instanceof Date) {
      updates.dateOfBirth = dateToString(emp.dateOfBirth);
    } else if (typeof emp.dateOfBirth === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(emp.dateOfBirth)) {
      // Déjà au bon format, skip
    } else if (emp.dateOfBirth) {
      console.warn(`  ⚠️  Format inconnu pour dateOfBirth de ${emp.firstName} ${emp.lastName}:`, emp.dateOfBirth);
    }

    // hireDate
    if (emp.hireDate instanceof Date) {
      updates.hireDate = dateToString(emp.hireDate);
    } else if (typeof emp.hireDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(emp.hireDate)) {
      // Déjà au bon format, skip
    } else if (emp.hireDate) {
      console.warn(`  ⚠️  Format inconnu pour hireDate de ${emp.firstName} ${emp.lastName}:`, emp.hireDate);
    }

    // endDate
    if (emp.endDate instanceof Date) {
      updates.endDate = dateToString(emp.endDate);
    } else if (typeof emp.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(emp.endDate)) {
      // Déjà au bon format, skip
    } else if (emp.endDate) {
      console.warn(`  ⚠️  Format inconnu pour endDate de ${emp.firstName} ${emp.lastName}:`, emp.endDate);
    }

    if (Object.keys(updates).length > 0) {
      await Employee.updateOne({ _id: emp._id }, { $set: updates });
      console.log(`  ✅ Migré: ${emp.firstName} ${emp.lastName} (${Object.keys(updates).join(', ')})`);
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n📊 Employees: ${migrated} migrés, ${skipped} déjà au bon format`);
}

async function migrateShifts() {
  console.log('\n📝 Migration des Shifts...');

  const Shift = mongoose.connection.collection('shifts');
  const shifts = await Shift.find({}).toArray();

  let migrated = 0;
  let skipped = 0;

  for (const shift of shifts) {
    if (shift.date instanceof Date) {
      const dateStr = dateToString(shift.date);
      await Shift.updateOne({ _id: shift._id }, { $set: { date: dateStr } });
      console.log(`  ✅ Migré shift: ${shift._id} (${shift.date} → ${dateStr})`);
      migrated++;
    } else if (typeof shift.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(shift.date)) {
      // Déjà au bon format
      skipped++;
    } else {
      console.warn(`  ⚠️  Format inconnu pour shift ${shift._id}:`, shift.date);
    }
  }

  console.log(`\n📊 Shifts: ${migrated} migrés, ${skipped} déjà au bon format`);
}

async function main() {
  console.log('🚀 Démarrage de la migration Date → String\n');
  console.log('⚠️  ATTENTION: Assurez-vous d\'avoir fait un backup de la BD avant de continuer !');
  console.log('\nAttente de 5 secondes pour vous permettre d\'annuler (Ctrl+C)...');

  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Connexion à la BD
    console.log('\n📡 Connexion à MongoDB...');
    await connectMongoose();
    console.log('✅ Connecté à MongoDB\n');

    // Migration Employees
    await migrateEmployees();

    // Migration Shifts
    await migrateShifts();

    console.log('\n✨ Migration terminée avec succès !');
    console.log('\n⚠️  Vérifiez que tout fonctionne correctement avant de supprimer votre backup.\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

// Exécution
main();
