/**
 * Script de migration pour corriger les dates employés au format invalide
 * Convertit les dates "Mon Feb 14 2005 01:00:00 GMT+0100" en "YYYY-MM-DD"
 *
 * Usage: npx tsx scripts/fix-employee-dates.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(__dirname, '../.env.local') })

import { connectMongoose } from '../src/lib/mongodb'
import { Employee } from '../src/models/employee'

async function fixEmployeeDates() {
  console.log('🔧 Starting employee dates migration...\n')

  try {
    // Connect to MongoDB
    await connectMongoose()
    console.log('✅ Connected to MongoDB\n')

    // Get all employees
    const employees = await Employee.find({})
    console.log(`📊 Found ${employees.length} employees\n`)

    let fixedCount = 0
    let errorCount = 0

    for (const employee of employees) {
      let needsUpdate = false
      const updates: any = {}

      // Check and fix dateOfBirth
      if (employee.dateOfBirth && typeof employee.dateOfBirth === 'string') {
        const dateOfBirthStr = employee.dateOfBirth as string

        // Si ce n'est pas au format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirthStr)) {
          try {
            const parsedDate = new Date(dateOfBirthStr)
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear()
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
              const day = String(parsedDate.getDate()).padStart(2, '0')
              updates.dateOfBirth = `${year}-${month}-${day}`
              needsUpdate = true
              console.log(`  📅 dateOfBirth: "${dateOfBirthStr}" → "${updates.dateOfBirth}"`)
            }
          } catch (error) {
            console.error(`  ❌ Error parsing dateOfBirth for ${employee.firstName} ${employee.lastName}: ${error}`)
            errorCount++
          }
        }
      }

      // Check and fix hireDate
      if (employee.hireDate && typeof employee.hireDate === 'string') {
        const hireDateStr = employee.hireDate as string

        // Si ce n'est pas au format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(hireDateStr)) {
          try {
            const parsedDate = new Date(hireDateStr)
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear()
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
              const day = String(parsedDate.getDate()).padStart(2, '0')
              updates.hireDate = `${year}-${month}-${day}`
              needsUpdate = true
              console.log(`  📅 hireDate: "${hireDateStr}" → "${updates.hireDate}"`)
            }
          } catch (error) {
            console.error(`  ❌ Error parsing hireDate for ${employee.firstName} ${employee.lastName}: ${error}`)
            errorCount++
          }
        }
      }

      // Check and fix startDate
      if (employee.startDate && typeof employee.startDate === 'string') {
        const startDateStr = employee.startDate as string

        // Si ce n'est pas au format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
          try {
            const parsedDate = new Date(startDateStr)
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear()
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
              const day = String(parsedDate.getDate()).padStart(2, '0')
              updates.startDate = `${year}-${month}-${day}`
              needsUpdate = true
              console.log(`  📅 startDate: "${startDateStr}" → "${updates.startDate}"`)
            }
          } catch (error) {
            console.error(`  ❌ Error parsing startDate for ${employee.firstName} ${employee.lastName}: ${error}`)
            errorCount++
          }
        }
      }

      // Check and fix endDate
      if (employee.endDate && typeof employee.endDate === 'string') {
        const endDateStr = employee.endDate as string

        // Si ce n'est pas au format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
          try {
            const parsedDate = new Date(endDateStr)
            if (!isNaN(parsedDate.getTime())) {
              const year = parsedDate.getFullYear()
              const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
              const day = String(parsedDate.getDate()).padStart(2, '0')
              updates.endDate = `${year}-${month}-${day}`
              needsUpdate = true
              console.log(`  📅 endDate: "${endDateStr}" → "${updates.endDate}"`)
            }
          } catch (error) {
            console.error(`  ❌ Error parsing endDate for ${employee.firstName} ${employee.lastName}: ${error}`)
            errorCount++
          }
        }
      }

      // Update if needed
      if (needsUpdate) {
        console.log(`\n🔄 Updating ${employee.firstName} ${employee.lastName}...`)
        await Employee.updateOne(
          { _id: employee._id },
          { $set: updates }
        )
        fixedCount++
        console.log(`✅ Updated!\n`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Migration complete!`)
    console.log(`📊 Total employees: ${employees.length}`)
    console.log(`✅ Fixed: ${fixedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('='.repeat(50) + '\n')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run migration
fixEmployeeDates()
