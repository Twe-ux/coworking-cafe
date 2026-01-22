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
 * Connect using Mongoose - SIMPLIFIED VERSION
 * Always checks connection state and reconnects if needed
 */
export async function connectDB(): Promise<typeof mongoose> {
  const currentState = mongoose.connection.readyState;
  console.log(`[connectDB] Current mongoose state: ${currentState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);

  // If already connected, return immediately
  if (currentState === 1) {
    console.log('[connectDB] Already connected, returning existing connection');
    return mongoose;
  }

  // If currently connecting, wait a bit and check again
  if (currentState === 2) {
    console.log('[connectDB] Connection in progress, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mongoose.connection.readyState === 1) {
      console.log('[connectDB] Connection completed while waiting');
      return mongoose;
    }
  }

  // Need to connect
  console.log('[connectDB] Creating new connection...');
  const uri = getMongoUri();
  console.log(`[connectDB] URI starts with: ${uri.substring(0, 20)}...`);

  try {
    await mongoose.connect(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 5,
      family: 4, // Force IPv4
      retryWrites: true,
      retryReads: true,
    });

    console.log(`✓ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.db?.databaseName}`);
    return mongoose;
  } catch (error: any) {
    console.error(`✗ MongoDB connection error:`, error.message);
    throw error;
  }
}

// Export as default and as named export
export default connectDB;
