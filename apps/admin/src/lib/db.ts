// Re-export the MongoDB connection from mongodb.ts
// This provides a shorter alias: @/lib/db instead of @/lib/mongodb
export { default } from './mongodb';
export { default as connectDB } from './mongodb';
