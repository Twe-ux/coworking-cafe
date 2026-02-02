import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { requireAuth } from "@/lib/api/auth";
import B2BRevenue from "@/models/b2bRevenue";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/accounting/b2b-revenue/[...id]
 * Récupérer une entrée CA B2B par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const id = params.id.join("/");
    const entry = await B2BRevenue.findById(id).lean();

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: "B2B revenue entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error fetching B2B revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch B2B revenue entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounting/b2b-revenue/[...id]
 * Mettre à jour une entrée CA B2B (avec upsert)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const id = params.id.join("/");
    const body = await request.json();

    // Validation
    if (body.ttc !== undefined && body.ht !== undefined && body.ttc < body.ht) {
      return NextResponse.json(
        {
          success: false,
          error: "TTC must be greater than or equal to HT",
        },
        { status: 400 }
      );
    }

    // Calculate TVA
    const updateData: any = {};
    if (body.ht !== undefined) updateData.ht = Number(body.ht);
    if (body.ttc !== undefined) updateData.ttc = Number(body.ttc);
    if (body.date !== undefined) updateData.date = body.date;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Auto-calculate TVA if HT or TTC changed
    if (body.ht !== undefined || body.ttc !== undefined) {
      const ht = body.ht !== undefined ? Number(body.ht) : 0;
      const ttc = body.ttc !== undefined ? Number(body.ttc) : 0;
      updateData.tva = ttc - ht;
    }

    const updatedEntry = await B2BRevenue.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    if (!updatedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "B2B revenue entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating B2B revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update B2B revenue entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounting/b2b-revenue/[...id]
 * Supprimer une entrée CA B2B
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"]);
    if (!authResult.authorized) {
      return authResult.response;
    }

    await connectMongoose();

    const id = params.id.join("/");
    const deletedEntry = await B2BRevenue.findByIdAndDelete(id).lean();

    if (!deletedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "B2B revenue entry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "B2B revenue entry deleted successfully",
      data: deletedEntry,
    });
  } catch (error) {
    console.error("Error deleting B2B revenue entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete B2B revenue entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
