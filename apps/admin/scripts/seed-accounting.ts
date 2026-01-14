import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://dev:***REMOVED***@coworking.jhxdixz.mongodb.net/coworking-admin'

const sampleData = [
  {
    _id: '2026/01/10',
    prestaB2B: [
      { label: 'Coworking Day Pass', value: 350 },
      { label: 'Meeting Room', value: 200 },
    ],
    depenses: [
      { label: 'Fournitures bureau', value: 50 },
      { label: 'Café/Snacks', value: 75 },
    ],
    especes: 150,
    virement: 200,
    cbClassique: 100,
    cbSansContact: 175,
  },
  {
    _id: '2026/01/11',
    prestaB2B: [
      { label: 'Coworking Day Pass', value: 420 },
      { label: 'Private Office', value: 600 },
    ],
    depenses: [
      { label: 'Nettoyage', value: 100 },
      { label: 'Internet', value: 80 },
    ],
    especes: 200,
    virement: 500,
    cbClassique: 150,
    cbSansContact: 270,
  },
  {
    _id: '2026/01/12',
    prestaB2B: [
      { label: 'Coworking Day Pass', value: 280 },
      { label: 'Event Space', value: 800 },
    ],
    depenses: [
      { label: 'Fournitures', value: 45 },
      { label: 'Maintenance', value: 120 },
    ],
    especes: 100,
    virement: 800,
    cbClassique: 80,
    cbSansContact: 180,
  },
  {
    _id: '2026/01/13',
    prestaB2B: [
      { label: 'Coworking Day Pass', value: 490 },
      { label: 'Meeting Room', value: 250 },
      { label: 'Private Office', value: 300 },
    ],
    depenses: [
      { label: 'Café/Snacks', value: 90 },
    ],
    especes: 250,
    virement: 400,
    cbClassique: 200,
    cbSansContact: 290,
  },
]

async function seed() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const db = client.db('coworking-admin')
    const collection = db.collection('cashentries')

    // Clear existing data
    await collection.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Insert sample data
    const result = await collection.insertMany(sampleData)
    console.log(`✅ Inserted ${result.insertedCount} cash entries`)

    // Display inserted data
    const entries = await collection.find({}).sort({ _id: -1 }).toArray()
    console.log('\n📊 Sample data:')
    entries.forEach((entry) => {
      const totalPresta = entry.prestaB2B.reduce(
        (sum: number, item: any) => sum + item.value,
        0
      )
      const totalDepenses = entry.depenses?.reduce(
        (sum: number, item: any) => sum + item.value,
        0
      ) || 0
      console.log(
        `  ${entry._id}: Presta=${totalPresta}€, Dépenses=${totalDepenses}€`
      )
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.close()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

seed()
