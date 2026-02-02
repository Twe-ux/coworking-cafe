import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import B2BRevenue from "@/models/b2bRevenue";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/accounting/b2b-revenue
 * Liste des CA B2B avec filtres optionnels
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = {};
    if (startDate && endDate) {
      query = {
        _id: {
          $gte: startDate.replace(/-/g, "/"),
          $lte: endDate.replace(/-/g, "/"),
        },
      };
    }

    const entries = await B2BRevenue.find(query).sort({ _id: -1 }).lean();

    // Ajouter le champ date pour chaque entrée (copie de _id)
    const entriesWithDate = entries.map((entry) => ({
      ...entry,
      date: entry._id.replace(/\//g, "-"),
    }));

    return NextResponse.json({
      success: true,
      data: entriesWithDate,
      count: entriesWithDate.length,
    });
  } catch (error) {
    console.error("Error fetching B2B revenue entries:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch B2B revenue entries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/b2b-revenue
 * Créer une nouvelle entrée CA B2B
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const body = await request.json();

    // Validation
    if (!body.date || body.ht === undefined || body.ttc === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, ht, ttc",
        },
        { status: 400 }
      );
    }

    // Vérifier que TTC >= HT
    if (body.ttc < body.ht) {
      return NextResponse.json(
        {
          success: false,
          error: "TTC must be greater than or equal to HT",
        },
        { status: 400 }
      );
    }

    // Format date as YYYY/MM/DD for _id
    const dateObj = new Date(body.date);
    const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`;

    // Check if entry already exists
    const existing = await B2BRevenue.findById(formattedDate);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "B2B revenue entry for this date already exists",
        },
        { status: 409 }
      );
    }

    // Calculate TVA
    const tva = body.ttc - body.ht;

    const entry = new B2BRevenue({
      _id: formattedDate,
      date: body.date,
      ht: Number(body.ht) || 0,
      ttc: Number(body.ttc) || 0,
      tva,
      notes: body.notes || "",
    });

    await entry.save();

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating B2B revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create B2B revenue entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
