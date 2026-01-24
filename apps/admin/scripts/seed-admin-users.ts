/**
 * Script pour créer les employés admin avec PIN uniquement (pas de User)
 *
 * Usage: npx tsx scripts/seed-admin-users.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Import direct du model Employee
import '../src/models/employee'

const Employee = mongoose.model('Employee')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-cafe'

const adminEmployees = [
  {
    // Admin Dev
    firstName: 'Admin',
    lastName: 'Dev',
    email: 'dev@coworkingcafe.fr',
    phone: '+33123456789',
    employeeRole: 'Manager', // Pour avoir accès complet
    clockingCode: '1111', // PIN pointage
    dashboardPin: '111111', // PIN dashboard
    dateOfBirth: new Date('1990-01-01'),
    hireDate: new Date(),
    contractType: 'CDI',
    contractualHours: 35,
  },
  {
    // Admin Manager
    firstName: 'Admin',
    lastName: 'Manager',
    email: 'manager@coworkingcafe.fr',
    phone: '+33123456790',
    employeeRole: 'Manager',
    clockingCode: '2222', // PIN pointage
    dashboardPin: '222222', // PIN dashboard
    dateOfBirth: new Date('1990-01-01'),
    hireDate: new Date(),
    contractType: 'CDI',
    contractualHours: 35,
  },
]

async function seedAdminEmployees() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    console.log('\n📝 Création des employés admin...\n')

    for (const empData of adminEmployees) {
      const {
        firstName,
        lastName,
        email,
        phone,
        employeeRole,
        clockingCode,
        dashboardPin,
        dateOfBirth,
        hireDate,
        contractType,
        contractualHours,
      } = empData

      // 1. Vérifier si l'employé existe déjà (par email)
      const existingEmployee = await Employee.findOne({ email: email.toLowerCase() })

      if (existingEmployee) {
        console.log(`⚠️  Employé ${email} existe déjà, mise à jour des PINs...`)

        // Mettre à jour les PINs
        existingEmployee.clockingCode = clockingCode
        existingEmployee.dashboardPinHash = await bcrypt.hash(dashboardPin, 10)
        await existingEmployee.save()

        console.log(`✅ PINs mis à jour pour ${firstName} ${lastName}`)
        console.log(`   📧 Email: ${email}`)
        console.log(`   🔢 PIN dashboard: ${dashboardPin}`)
        console.log(`   🔢 PIN pointage: ${clockingCode}\n`)
        continue
      }

      // 2. Hasher le PIN dashboard
      const dashboardPinHash = await bcrypt.hash(dashboardPin, 10)

      // 3. Créer l'Employee (SANS User)
      const newEmployee = await Employee.create({
        firstName,
        lastName,
        employeeRole,
        clockingCode,
        dashboardPinHash, // ✅ Stocké dans Employee
        color: '#3B82F6', // Bleu par défaut
        email: email.toLowerCase(),
        phone,
        dateOfBirth,
        placeOfBirth: {
          city: 'Paris',
          department: '75',
          country: 'France',
        },
        address: {
          street: '123 Rue de la Paix',
          postalCode: '75001',
          city: 'Paris'
        },
        socialSecurityNumber: `19901${clockingCode}111111`, // Numéro fictif (15 chiffres)
        contractType,
        contractualHours,
        hireDate,
        isActive: true,
        onboardingStatus: {
          step1Completed: true,
          step2Completed: true,
          step3Completed: true,
          step4Completed: true,
          contractGenerated: true,
          dpaeCompleted: true,
          bankDetailsProvided: true,
          contractSent: true,
        },
      })

      console.log(`✅ Employé créé: ${firstName} ${lastName}`)
      console.log(`   📧 Email: ${email}`)
      console.log(`   👔 Rôle: ${employeeRole}`)
      console.log(`   🔢 PIN dashboard: ${dashboardPin}`)
      console.log(`   🔢 PIN pointage: ${clockingCode}`)
      console.log(`   👨‍💼 Employee ID: ${newEmployee._id}\n`)
    }

    console.log('✅ Tous les employés admin ont été créés/mis à jour avec succès!')
    console.log('\n📋 Connexion au dashboard:')
    console.log('  🌐 URL: http://localhost:3001/login')
    console.log('\n  👤 Dev:')
    console.log('     PIN: 111111 (PAS D\'EMAIL)')
    console.log('\n  👤 Manager:')
    console.log('     PIN: 222222 (PAS D\'EMAIL)')
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Déconnecté de MongoDB')
  }
}

// Exécuter le script
seedAdminEmployees()
