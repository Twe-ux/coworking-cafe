import { connectDB } from "../../../lib/mongodb";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Temporary debug endpoint - REMOVE IN PRODUCTION after debugging

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    const collections = db ? await db.listCollections().toArray() : [];

    return NextResponse.json({
      connected: mongoose.connection.readyState === 1,
      database: db?.databaseName || mongoose.connection.name,
      host: mongoose.connection.host,
      collections: collections.map((c) => c.name),
      mongoUriPreview: process.env.MONGODB_URI?.substring(0, 60) + "...",
      // Show the database name from the URI
      uriDatabase:
        process.env.MONGODB_URI?.match(/\.net\/([^?]+)/)?.[1] || "not-found",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: String(error),
        mongoUriPreview: process.env.MONGODB_URI?.substring(0, 60) + "...",
      },
      { status: 500 },
    );
  }
}
