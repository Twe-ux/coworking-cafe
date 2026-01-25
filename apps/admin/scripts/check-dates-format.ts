/**
 * Script de vérification : Format des dates en BD
 *
 * Vérifie si les dates sont déjà au format String ou si elles sont en Date
 * Permet de savoir si la migration est nécessaire ou non
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Charger .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { connectMongoose } from '../src/lib/mongodb';

async function checkEmployees() {
  console.log('\n📋 Vérification des Employees...\n');

  const Employee = mongoose.connection.collection('employees');
  const count = await Employee.countDocuments();

  if (count === 0) {
    console.log('  ℹ️  Aucun employé en base de données\n');
    return { total: 0, needMigration: 0, alreadyString: 0 };
  }

  const employees = await Employee.find({}).limit(10).toArray();
  let needMigration = 0;
  let alreadyString = 0;

  for (const emp of employees) {
    const issues: string[] = [];

    // dateOfBirth
    if (emp.dateOfBirth instanceof Date) {
      issues.push('dateOfBirth: Date');
      needMigration++;
    } else if (typeof emp.dateOfBirth === 'string') {
      issues.push('dateOfBirth: String ✅');
      alreadyString++;
    }

    // hireDate
    if (emp.hireDate instanceof Date) {
      issues.push('hireDate: Date');
      needMigration++;
    } else if (typeof emp.hireDate === 'string') {
      issues.push('hireDate: String ✅');
      alreadyString++;
    }

    // endDate
    if (emp.endDate) {
      if (emp.endDate instanceof Date) {
        issues.push('endDate: Date');
        needMigration++;
      } else if (typeof emp.endDate === 'string') {
        issues.push('endDate: String ✅');
        alreadyString++;
      }
    }

    console.log(`  👤 ${emp.firstName} ${emp.lastName}:`);
    issues.forEach(issue => console.log(`     - ${issue}`));
  }

  if (count > 10) {
    console.log(`\n  ℹ️  ${count - 10} autres employés non affichés`);
  }

  return { total: count, needMigration, alreadyString };
}

async function checkShifts() {
  console.log('\n📋 Vérification des Shifts...\n');

  const Shift = mongoose.connection.collection('shifts');
  const count = await Shift.countDocuments();

  if (count === 0) {
    console.log('  ℹ️  Aucun shift en base de données\n');
    return { total: 0, needMigration: 0, alreadyString: 0 };
  }

  const shifts = await Shift.find({}).limit(10).toArray();
  let needMigration = 0;
  let alreadyString = 0;

  for (const shift of shifts) {
    if (shift.date instanceof Date) {
      console.log(`  📅 Shift ${shift._id}: Date (${shift.date}) ❌`);
      needMigration++;
    } else if (typeof shift.date === 'string') {
      console.log(`  📅 Shift ${shift._id}: String (${shift.date}) ✅`);
      alreadyString++;
    }
  }

  if (count > 10) {
    console.log(`\n  ℹ️  ${count - 10} autres shifts non affichés`);
  }

  return { total: count, needMigration, alreadyString };
}

async function main() {
  console.log('🔍 Vérification du format des dates en BD\n');

  try {
    // Connexion à la BD
    console.log('📡 Connexion à MongoDB...');
    await connectMongoose();
    console.log('✅ Connecté à MongoDB');

    // Vérification Employees
    const empStats = await checkEmployees();

    // Vérification Shifts
    const shiftStats = await checkShifts();

    // Résumé
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RÉSUMÉ\n');

    console.log(`Employees (${empStats.total} total):`);
    if (empStats.total === 0) {
      console.log('  → Base vide, pas de migration nécessaire');
    } else if (empStats.needMigration > 0) {
      console.log(`  → ⚠️  ${empStats.needMigration} champs en Date → MIGRATION NÉCESSAIRE`);
      console.log(`  → ✅ ${empStats.alreadyString} champs déjà en String`);
    } else {
      console.log('  → ✅ Tous les champs sont déjà en String');
    }

    console.log(`\nShifts (${shiftStats.total} total):`);
    if (shiftStats.total === 0) {
      console.log('  → Base vide, pas de migration nécessaire');
    } else if (shiftStats.needMigration > 0) {
      console.log(`  → ⚠️  ${shiftStats.needMigration} dates en Date → MIGRATION NÉCESSAIRE`);
      console.log(`  → ✅ ${shiftStats.alreadyString} dates déjà en String`);
    } else {
      console.log('  → ✅ Toutes les dates sont déjà en String');
    }

    // Conclusion
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (empStats.needMigration > 0 || shiftStats.needMigration > 0) {
      console.log('🚨 MIGRATION NÉCESSAIRE\n');
      console.log('Exécutez le script de migration :');
      console.log('  pnpm tsx scripts/migrate-dates-to-strings.ts\n');
    } else if (empStats.total === 0 && shiftStats.total === 0) {
      console.log('✅ BASE DE DONNÉES VIDE\n');
      console.log('Pas de migration nécessaire, vous pouvez commencer à utiliser l\'application.\n');
    } else {
      console.log('✅ AUCUNE MIGRATION NÉCESSAIRE\n');
      console.log('Toutes les dates sont déjà au bon format (String).\n');
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB\n');
  }
}

// Exécution
main();
