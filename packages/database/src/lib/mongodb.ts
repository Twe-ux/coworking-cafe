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

export async function connectToDatabase() {
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
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
  }

  try {
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}
