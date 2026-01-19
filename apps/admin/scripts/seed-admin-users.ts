/**
 * Script pour initialiser les utilisateurs admin et dev avec leurs PINs
 *
 * Usage: npx tsx scripts/seed-admin-users.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { UserModel } from '../src/models/user'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-cafe'

const adminUsers = [
  {
    name: 'Dev',
    email: 'dev@coworkingcafe.fr',
    role: 'dev' as const,
    pin: '111111',
  },
  {
    name: 'Admin',
    email: 'admin@coworkingcafe.fr',
    role: 'admin' as const,
    pin: '222222',
  },
]

async function seedAdminUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    console.log('\n📝 Création/Mise à jour des utilisateurs admin...')

    for (const userData of adminUsers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserModel.findOne({ email: userData.email })

      if (existingUser) {
        // Mettre à jour le PIN
        existingUser.pin = userData.pin
        existingUser.name = userData.name
        existingUser.role = userData.role
        await existingUser.save()
        console.log(`✅ Utilisateur mis à jour: ${userData.email} (PIN: ${userData.pin})`)
      } else {
        // Créer le nouvel utilisateur
        await UserModel.create(userData)
        console.log(`✅ Utilisateur créé: ${userData.email} (PIN: ${userData.pin})`)
      }
    }

    console.log('\n✅ Tous les utilisateurs ont été créés/mis à jour avec succès!')
    console.log('\n📋 Résumé:')
    console.log('  - Dev: PIN 111111')
    console.log('  - Admin: PIN 222222')
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec ces PINs!')

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Déconnecté de MongoDB')
  }
}

// Exécuter le script
seedAdminUsers()
