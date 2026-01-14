import { MongoClient, Db, MongoClientOptions } from "mongodb";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV !== "development") {
  console.warn(
    "Variable d'environnement MONGODB_URI manquante - certaines fonctionnalités seront limitées"
  );
}
const databaseName = process.env.MONGODB_DB || "coworking-admin";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 120000,
  connectTimeoutMS: 30000,
  family: 4,
  maxIdleTimeMS: 300000,
  compressors: ["zlib"],
  retryWrites: true,
  retryReads: true,
  maxConnecting: 2,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const dbCache = new Map<string, Db>();

if (uri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
      _mongoDbCache?: Map<string, Db>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    if (!globalWithMongo._mongoDbCache) {
      globalWithMongo._mongoDbCache = new Map<string, Db>();
    }

    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export async function connectToDatabase(
  dbName?: string
): Promise<{ client: MongoClient; db: Db }> {
  if (!uri) {
    throw new Error("Variable d'environnement MONGODB_URI manquante");
  }

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const connectedClient = await clientPromise;
      await connectedClient.db().admin().ping();

      const targetDbName = dbName || databaseName;

      let db: Db;
      if (process.env.NODE_ENV === "development") {
        const globalWithMongo = global as typeof globalThis & {
          _mongoDbCache?: Map<string, Db>;
        };
        if (!globalWithMongo._mongoDbCache?.has(targetDbName)) {
          db = connectedClient.db(targetDbName);
          globalWithMongo._mongoDbCache?.set(targetDbName, db);
        } else {
          db = globalWithMongo._mongoDbCache.get(targetDbName)!;
        }
      } else {
        if (!dbCache.has(targetDbName)) {
          db = connectedClient.db(targetDbName);
          dbCache.set(targetDbName, db);
        } else {
          db = dbCache.get(targetDbName)!;
        }
      }

      return { client: connectedClient, db };
    } catch (error) {
      retryCount++;
      console.error(
        `Tentative de connexion MongoDB ${retryCount}/${maxRetries} échouée:`,
        error
      );

      if (retryCount >= maxRetries) {
        throw new Error(
          `Impossible de se connecter à MongoDB après ${maxRetries} tentatives: ${
            error instanceof Error ? error.message : "Erreur inconnue"
          }`
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );
    }
  }

  throw new Error("Erreur inattendue lors de la connexion MongoDB");
}

export async function connectMongoose(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error("Variable d'environnement MONGODB_URI manquante");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  return await mongoose.connect(uri, {
    dbName: databaseName,
  });
}

export async function closeConnection(): Promise<void> {
  try {
    if (clientPromise) {
      const connectedClient = await clientPromise;
      await connectedClient.close();
    }
    if (mongoose.connection.readyState >= 1) {
      await mongoose.disconnect();
    }
    dbCache.clear();
  } catch (error) {
    console.error("Erreur MongoDB:", error);
  }
}

export default clientPromise;
