import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}
