import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof import('mongoose') | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using cached connection
 * Same pattern as apps/admin and packages/database
 */
export async function connectDB() {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (global.mongoose.conn && mongoose.connection.readyState === 1) {
    return global.mongoose.conn;
  }

  // Si déconnecté, on reset tout
  if (mongoose.connection.readyState === 0) {
    global.mongoose.conn = null;
    global.mongoose.promise = null;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5, // Limit connections for M0 cluster
      minPoolSize: 1,
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 10000,
    };

    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
    console.log('✓ MongoDB connected successfully');
  } catch (e) {
    global.mongoose.promise = null;
    console.error('✗ MongoDB connection error:', e);
    throw e;
  }

  return global.mongoose.conn;
}

// Export as default and as named export
export default connectDB;
