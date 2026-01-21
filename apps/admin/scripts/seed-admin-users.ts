/**
 * Script pour initialiser les utilisateurs admin et dev avec leurs PINs
 *
 * Usage: npx tsx scripts/seed-admin-users.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { User, Role } from '@coworking-cafe/database'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-cafe'

const adminUsers = [
  {
    givenName: 'Dev',
    email: 'dev@coworkingcafe.fr',
    password: '$2a$10$defaultHashForSeedOnly', // Hash temporaire
    roleSlug: 'dev' as const,
    pin: '111111',
  },
  {
    givenName: 'Admin',
    email: 'admin@coworkingcafe.fr',
    password: '$2a$10$defaultHashForSeedOnly', // Hash temporaire
    roleSlug: 'admin' as const,
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
      // Trouver le role par slug
      const role = await Role.findOne({ slug: userData.roleSlug })
      if (!role) {
        console.error(`❌ Role '${userData.roleSlug}' not found in database. Please seed roles first.`)
        continue
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userData.email })

      if (existingUser) {
        // Mettre à jour le PIN
        existingUser.pin = userData.pin
        existingUser.givenName = userData.givenName
        existingUser.role = role._id as any
        await existingUser.save()
        console.log(`✅ Utilisateur mis à jour: ${userData.email} (PIN: ${userData.pin})`)
      } else {
        // Créer le nouvel utilisateur
        await User.create({
          email: userData.email,
          password: userData.password,
          givenName: userData.givenName,
          role: role._id,
          pin: userData.pin,
          newsletter: false,
          isTemporary: false,
        })
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
