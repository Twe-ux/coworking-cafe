import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { requireAuth } from '@/lib/api/auth';
import { CashRegister } from '@coworking-cafe/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/cash-register/list
 * Get list of cash register entries (ADMIN ONLY)
 *
 * Query params:
 * - date: YYYY-MM-DD (specific date)
 * - month: YYYY-MM (specific month)
 * - limit: number of results (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // PUBLIC - No auth required (staff can view history)
    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Build query
    const query: Record<string, unknown> = {};

    // Filter by specific date
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return NextResponse.json(
          { success: false, error: 'Format de date invalide (YYYY-MM-DD requis)' },
          { status: 400 }
        );
      }
      query.date = date;
    }

    // Filter by month
    if (month && !date) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return NextResponse.json(
          { success: false, error: 'Format de mois invalide (YYYY-MM requis)' },
          { status: 400 }
        );
      }
      // Match all dates starting with YYYY-MM
      query.date = { $regex: `^${month}` };
    }

    // Execute query
    const [entries, total] = await Promise.all([
      CashRegister.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .lean(),
      CashRegister.countDocuments(query)
    ]);

    // Transform entries to ensure proper types
    const transformedEntries = entries.map((entry: any) => ({
      _id: entry._id.toString(),
      date: entry.date,
      amount: entry.amount,
      countedBy: entry.countedBy,
      countDetails: entry.countDetails,
      notes: entry.notes,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        entries: transformedEntries,
        total,
        filters: { date, month, limit }
      }
    });
  } catch (error) {
    console.error('Error fetching cash register entries:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
