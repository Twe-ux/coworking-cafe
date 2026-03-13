import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { Product } from "@/models/inventory/product";
import { getRequiredRoles } from "@/lib/inventory/permissions";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/ruptures - Liste des produits en rupture de stock
 * Auth: Public (accessible sans authentification pour staff)
 */
export async function GET(request: NextRequest) {
  try {
    console.log("[GET /api/inventory/ruptures] Starting request");
    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const includeHandled = searchParams.get("includeHandled") === "true";

    // Build filter: produits avec stock = 0, actifs, et non traités
    // outOfStockHandledAt = produit dans une commande/achat (suppression de la liste)
    const filter: Record<string, unknown> = {
      currentStock: 0,
      isActive: true,
      outOfStockHandledAt: { $exists: false },
    };

    console.log("[GET /api/inventory/ruptures] Filter:", JSON.stringify(filter));

    const products = await Product.find(filter)
      .sort({ updatedAt: -1 }) // Plus récents d'abord
      .lean();

    console.log("[GET /api/inventory/ruptures] Found", products.length, "products");

    const transformedProducts = products.map((product: {
      [key: string]: unknown;
    }) => ({
      _id: product._id?.toString() || "",
      name: product.name || "",
      category: product.category || "",
      supplierName: (product.supplierName as string) || "",
      purchaseMarked: product.purchaseMarked || false,
      updatedAt: product.updatedAt
        ? (product.updatedAt as Date).toISOString()
        : "",
    }));

    console.log("[GET /api/inventory/ruptures] Returning", transformedProducts.length, "transformed products");
    return successResponse(transformedProducts);
  } catch (error) {
    console.error("[GET /api/inventory/ruptures] Error:", error);
    return errorResponse(
      "Erreur lors de la récupération des ruptures",
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * PATCH /api/inventory/ruptures - Toggle checkbox "marqué pour achat"
 * Body: { productId: string, marked: boolean }
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles("manageProducts"));
    if (!authResult.authorized) return authResult.response;

    await connectMongoose();

    const body = await request.json();
    const { productId, marked } = body;

    if (!productId || typeof marked !== "boolean") {
      return errorResponse("productId et marked sont requis", undefined, 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse("Produit introuvable", undefined, 404);
    }

    // Toggle checkbox (indicateur visuel "marqué pour achat")
    product.purchaseMarked = marked;
    await product.save();

    return successResponse(
      {
        productId: product._id.toString(),
        productName: product.name,
        purchaseMarked: product.purchaseMarked,
      },
      marked
        ? `${product.name} marqué pour achat`
        : `${product.name} décoché`
    );
  } catch (error) {
    console.error("[PATCH /api/inventory/ruptures] Error:", error);
    return errorResponse(
      "Erreur lors de la mise à jour",
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
