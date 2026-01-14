import { connectDB } from "@/lib/mongodb";
import { ContactMail } from "@/models/contactMail";
import { NextResponse } from "next/server";

// Disable all caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Count unread messages
export async function GET() {
  try {    await connectDB();

    // Debug: Log collection name and database
    const collectionName = ContactMail.collection.name;
    const dbName = ContactMail.db.name;
    // Debug: Count all messages
    const totalCount = await ContactMail.countDocuments({});
    // Debug: Get all statuses
    const allMessages = await ContactMail.find({})
      .select("status _id")
      .limit(20)
      .lean();
    // Count unread
    const unreadCount = await ContactMail.countDocuments({
      status: "unread",
    });
    // Also count by each status
    const statusCounts = await ContactMail.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const response = NextResponse.json({
      count: unreadCount,
      timestamp: new Date().toISOString(),
      // Uncomment below for debugging
      // debug: {
      //   total: totalCount,
      //   byStatus: statusCounts,
      //   samples: allMessages
      // }
    });

    // Prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {    return NextResponse.json(
      { error: "Erreur lors du comptage des messages", details: String(error) },
      { status: 500 }
    );
  }
}
