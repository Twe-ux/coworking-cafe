/**
 * Script pour initialiser les rôles dans la base de données
 *
 * Usage: npx tsx scripts/seed-roles.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Import direct du model Role pour éviter l'import de Stripe
import '../../../packages/database/src/models/role'
const Role = mongoose.model('Role')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworking-cafe'

const roles = [
  {
    slug: 'dev',
    name: 'Développeur',
    level: 4,
    description: 'Accès complet au système (développement)',
  },
  {
    slug: 'admin',
    name: 'Administrateur',
    level: 3,
    description: 'Accès complet au dashboard admin',
  },
  {
    slug: 'staff',
    name: 'Staff',
    level: 2,
    description: 'Employé avec accès limité',
  },
  {
    slug: 'client',
    name: 'Client',
    level: 1,
    description: 'Utilisateur client standard',
  },
]

async function seedRoles() {
  try {
    console.log('🔌 Connexion à MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connecté à MongoDB')

    console.log('\n📝 Création/Mise à jour des rôles...')

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ slug: roleData.slug })

      if (existingRole) {
        // Mettre à jour le rôle existant
        existingRole.name = roleData.name
        existingRole.level = roleData.level
        existingRole.description = roleData.description
        await existingRole.save()
        console.log(`✅ Rôle mis à jour: ${roleData.name} (${roleData.slug})`)
      } else {
        // Créer le nouveau rôle
        await Role.create(roleData)
        console.log(`✅ Rôle créé: ${roleData.name} (${roleData.slug})`)
      }
    }

    console.log('\n✅ Tous les rôles ont été créés/mis à jour avec succès!')
    console.log('\n📋 Rôles disponibles:')
    console.log('  - dev (niveau 4) - Développeur')
    console.log('  - admin (niveau 3) - Administrateur')
    console.log('  - staff (niveau 2) - Staff')
    console.log('  - client (niveau 1) - Client')

  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Déconnecté de MongoDB')
  }
}

// Exécuter le script
seedRoles()
