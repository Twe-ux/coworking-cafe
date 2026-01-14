/**
 * Database connection helper for Mongoose
 * Provides connectDB() for API routes
 */
import { connectMongoose } from './mongodb';

/**
 * Connect to MongoDB using Mongoose
 * Used by API routes that need Mongoose models
 */
async function connectDB() {
  return await connectMongoose();
}

export default connectDB;
export { connectDB };
