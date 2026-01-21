import mongoose from 'mongoose';

/**
 * Get MongoDB URI from environment
 */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI manquante dans .env.local');
  }

  return uri;
}

const databaseName = process.env.MONGODB_DB || "coworking-admin";

/**
 * Connect using Mongoose
 * Used for Mongoose models
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const uri = getMongoUri();

  // Connect with Mongoose
  await mongoose.connect(uri, {
    dbName: databaseName,
  });

  const host = mongoose.connection.host;
  const dbName = mongoose.connection.db?.databaseName || mongoose.connection.name;
  console.log(`✓ MongoDB connected: ${host}/${dbName}`);

  return mongoose;
}

// Export as default and as named export
export default connectDB;
