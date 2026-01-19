/**
 * Script pour migrer complètement vers le système d'authentification par PIN
 *
 * Ce script:
 * 1. Nettoie les anciens users
 * 2. Crée les nouveaux users avec la structure PIN
 *
 * Usage: pnpm migrate-to-pin-auth
 */

import dotenv from 'dotenv'
import path from 'path'
import { connectToDatabase } from '../src/lib/mongodb'
import { ObjectId } from 'mongodb'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const adminUsers = [
  {
    name: 'Dev',
    email: 'dev@coworkingcafe.fr',
    role: 'dev',
    pin: '111111',
  },
  {
    name: 'Admin',
    email: 'admin@coworkingcafe.fr',
    role: 'admin',
    pin: '222222',
  },
]

async function migrateToPin() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    const { db } = await connectToDatabase()
    console.log('✅ Connecté à MongoDB')

    const usersCollection = db.collection('users')

    console.log('\n🗑️  Nettoyage des anciens users admin...')

    // Supprimer les anciens users admin/dev
    const deleteResult = await usersCollection.deleteMany({
      email: { $in: ['dev@coworkingcafe.fr', 'admin@coworkingcafe.fr'] }
    })
    console.log(`✅ ${deleteResult.deletedCount} ancien(s) user(s) supprimé(s)`)

    console.log('\n📝 Création des nouveaux users avec PIN...')

    for (const userData of adminUsers) {
      const newUser = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await usersCollection.insertOne(newUser)
      console.log(`✅ Utilisateur créé: ${userData.email} (PIN: ${userData.pin})`)
    }

    console.log('\n✅ Migration terminée avec succès!')
    console.log('\n📋 Résumé:')
    console.log('  - Dev: PIN 111111')
    console.log('  - Admin: PIN 222222')
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec ces PINs!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

// Exécuter le script
migrateToPin()
