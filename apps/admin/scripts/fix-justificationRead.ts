/**
 * Migration Script: Fix missing justificationRead field
 *
 * This script adds justificationRead: false to all TimeEntry documents
 * that have a justificationNote but are missing the justificationRead field.
 *
 * Run with: npx tsx scripts/fix-justificationRead.ts
 */

import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

async function main() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not established')
    }

    const timeEntriesCollection = db.collection('timeentries')

    // Find all documents with justificationNote but missing justificationRead
    console.log('\n🔍 Finding TimeEntries with justificationNote but no justificationRead...')

    const docsToFix = await timeEntriesCollection.find({
      justificationNote: { $exists: true, $ne: null },
      justificationRead: { $exists: false }
    }).toArray()

    console.log(`📊 Found ${docsToFix.length} documents to fix`)

    if (docsToFix.length === 0) {
      console.log('✅ No documents need fixing!')
      await mongoose.connection.close()
      return
    }

    // Show examples
    console.log('\n📝 Example documents:')
    docsToFix.slice(0, 3).forEach((doc, index) => {
      console.log(`\n  ${index + 1}. ID: ${doc._id}`)
      console.log(`     Date: ${doc.date}`)
      console.log(`     ClockIn: ${doc.clockIn} - ClockOut: ${doc.clockOut || 'N/A'}`)
      console.log(`     Justification: ${doc.justificationNote?.substring(0, 50)}...`)
    })

    // Ask for confirmation
    console.log('\n⚠️  This will add justificationRead: false to all these documents.')
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    await new Promise(resolve => setTimeout(resolve, 5000))

    // Update all documents
    console.log('🔧 Updating documents...')
    const result = await timeEntriesCollection.updateMany(
      {
        justificationNote: { $exists: true, $ne: null },
        justificationRead: { $exists: false }
      },
      {
        $set: { justificationRead: false }
      }
    )

    console.log(`\n✅ Migration completed!`)
    console.log(`   - Matched: ${result.matchedCount} documents`)
    console.log(`   - Modified: ${result.modifiedCount} documents`)

    // Verify
    const remaining = await timeEntriesCollection.countDocuments({
      justificationNote: { $exists: true, $ne: null },
      justificationRead: { $exists: false }
    })

    if (remaining > 0) {
      console.log(`\n⚠️  Warning: ${remaining} documents still missing justificationRead`)
    } else {
      console.log('\n✅ All documents have been fixed!')
    }

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Disconnected from MongoDB')
  }
}

main()
