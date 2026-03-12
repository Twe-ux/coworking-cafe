import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { Product } from "@/models/inventory/product";
import { sendOutOfStockNotification } from "@/lib/push-notifications";

export const dynamic = "force-dynamic";

const reportSchema = z.object({
  productId: z.string().min(1, "Product ID requis"),
});

/**
 * POST /api/inventory/report-out-of-stock
 * Report a product as out of stock (sets currentStock to 0 and notifies admin)
 * Body: { productId: string }
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check - All authenticated users can report out of stock
    const authResult = await requireAuth(["dev", "admin", "staff"]);
    if (!authResult.authorized) return authResult.response;

    // Connect to database
    await connectMongoose();

    // Parse and validate body
    const body = await request.json();

    let validated: z.infer<typeof reportSchema>;
    try {
      validated = reportSchema.parse(body);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return errorResponse(
          "Validation échouée",
          err.errors.map((e) => e.message).join(", "),
          400
        );
      }
      throw err;
    }

    // Find product
    const product = await Product.findById(validated.productId);
    if (!product) {
      return errorResponse("Produit introuvable", undefined, 404);
    }

    // Store previous stock for notification
    const previousStock = product.currentStock;

    // Update stock to 0
    product.currentStock = 0;
    await product.save();

    // Count total products out of stock
    const outOfStockCount = await Product.countDocuments({
      currentStock: 0,
      isActive: true,
    });

    // Send push notification to admin
    await sendOutOfStockNotification({
      id: product._id.toString(),
      productName: product.name,
      previousStock,
      reportedBy: authResult.user?.name || "Utilisateur",
      outOfStockCount,
    });

    return successResponse(
      {
        productId: product._id.toString(),
        productName: product.name,
        previousStock,
        newStock: 0,
      },
      `Rupture de stock signalée pour ${product.name}`,
      200
    );
  } catch (error) {
    console.error("[POST /api/inventory/report-out-of-stock] Error:", error);
    return errorResponse(
      "Erreur lors du signalement de rupture",
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
