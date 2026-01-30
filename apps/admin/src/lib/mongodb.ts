import { Db, MongoClient, MongoClientOptions } from "mongodb";
import mongoose from "mongoose";

/**
 * Get MongoDB URI from environment
 * Called lazily to ensure .env.local is loaded
 */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI manquante dans .env.local - Veuillez configurer la connexion MongoDB",
    );
  }

  return uri;
}

const databaseName = process.env.MONGODB_DB || "coworking_cafe";

const options: MongoClientOptions = {
  maxPoolSize: 5, // Reduced for M0 cluster limit
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 10000,
  family: 4,
  maxIdleTimeMS: 30000, // Close idle connections faster
  compressors: ["zlib"],
  retryWrites: true,
  retryReads: true,
  maxConnecting: 2,
};

/**
 * Global cache for MongoDB connections in development
 * Prevents connection growing during hot reloads
 */
interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
  dbCache: Map<string, Db>;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoCache: MongoCache | undefined;
}

let cached: MongoCache = global.mongoCache || {
  client: null,
  promise: null,
  dbCache: new Map<string, Db>(),
};

if (!global.mongoCache) {
  global.mongoCache = cached;
}

/**
 * Get MongoDB client promise
 * Initializes connection lazily on first call
 */
async function getClientPromise(): Promise<MongoClient> {
  if (cached.promise) {
    return cached.promise;
  }

  const uri = getMongoUri();

  if (process.env.NODE_ENV === "development") {
    // In development, use a global variable to preserve connection across hot reloads
    if (!cached.promise) {
      cached.client = new MongoClient(uri, options);
      cached.promise = cached.client.connect();
    }
  } else {
    // In production, create a new connection
    cached.client = new MongoClient(uri, options);
    cached.promise = cached.client.connect();
  }

  return cached.promise;
}

/**
 * Connect to MongoDB database
 * @param dbName - Optional database name (defaults to MONGODB_DB env var or "coworking_cafe")
 */
export async function connectToDatabase(
  dbName?: string,
): Promise<{ client: MongoClient; db: Db }> {
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const client = await getClientPromise();

      // Ping to verify connection
      await client.db().admin().ping();

      const targetDbName = dbName || databaseName;

      // Get or create database from cache
      let db: Db;
      if (!cached.dbCache.has(targetDbName)) {
        db = client.db(targetDbName);
        cached.dbCache.set(targetDbName, db);
      } else {
        db = cached.dbCache.get(targetDbName)!;
      }

      return { client, db };
    } catch (error) {
      retryCount++;
      console.error(
        `Tentative de connexion MongoDB ${retryCount}/${maxRetries} échouée:`,
        error,
      );

      if (retryCount >= maxRetries) {
        throw new Error(
          `Impossible de se connecter à MongoDB après ${maxRetries} tentatives: ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`,
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000),
      );
    }
  }

  throw new Error("Erreur inattendue lors de la connexion MongoDB");
}

/**
 * Connect using Mongoose
 * Used for Mongoose models
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  // Return existing connection if already connected
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  const uri = getMongoUri();

  // Connect with Mongoose
  await mongoose.connect(uri, {
    dbName: databaseName,
  });

  return mongoose;
}

/**
 * Close all MongoDB connections
 * Useful for cleanup in tests or serverless environments
 */
export async function closeConnection(): Promise<void> {
  try {
    // Close MongoClient
    if (cached.promise) {
      const client = await cached.promise;
      await client.close();
      cached.promise = null;
      cached.client = null;
    }

    // Close Mongoose
    if (mongoose.connection.readyState >= 1) {
      await mongoose.disconnect();
    }

    // Clear database cache
    cached.dbCache.clear();
  } catch (error) {
    console.error(
      "Erreur lors de la fermeture de la connexion MongoDB:",
      error,
    );
  }
}

/**
 * Export client promise for legacy code
 * @deprecated Use connectToDatabase() or connectMongoose() instead
 */
export default getClientPromise;
