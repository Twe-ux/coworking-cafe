import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { Product } from "@/models/inventory/product";
import { getRequiredRoles } from "@/lib/inventory/permissions";

export const dynamic = "force-dynamic";

/**
 * GET /api/inventory/ruptures - Liste des produits en rupture de stock
 * Query params: ?includeHandled=true (pour afficher aussi les produits traités)
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles("viewProducts"));
    if (!authResult.authorized) return authResult.response;

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const includeHandled = searchParams.get("includeHandled") === "true";

    // Build filter: produits avec stock = 0 et actifs
    const filter: Record<string, unknown> = {
      currentStock: 0,
      isActive: true,
    };

    // Si on ne veut pas les produits déjà traités
    if (!includeHandled) {
      filter.outOfStockHandledAt = { $exists: false };
    }

    const products = await Product.find(filter)
      .populate("supplierId", "name")
      .sort({ updatedAt: -1 }) // Plus récents d'abord
      .lean();

    const transformedProducts = products.map((product: {
      [key: string]: unknown;
    }) => ({
      _id: product._id?.toString() || "",
      name: product.name || "",
      category: product.category || "",
      supplierName: product.supplierName ||
        ((product.supplierId as { name?: string })?.name) || "",
      outOfStockHandledAt: product.outOfStockHandledAt
        ? (product.outOfStockHandledAt as Date).toISOString()
        : undefined,
      updatedAt: product.updatedAt
        ? (product.updatedAt as Date).toISOString()
        : "",
    }));

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
 * PATCH /api/inventory/ruptures - Marquer un produit comme traité/non-traité
 * Body: { productId: string, handled: boolean }
 * Auth: requireAuth(['admin', 'staff', 'dev'])
 */
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(getRequiredRoles("manageProducts"));
    if (!authResult.authorized) return authResult.response;

    await connectMongoose();

    const body = await request.json();
    const { productId, handled } = body;

    if (!productId || typeof handled !== "boolean") {
      return errorResponse("productId et handled sont requis", undefined, 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse("Produit introuvable", undefined, 404);
    }

    // Marquer comme traité ou non-traité
    if (handled) {
      product.outOfStockHandledAt = new Date();
    } else {
      product.outOfStockHandledAt = undefined;
    }

    await product.save();

    return successResponse(
      {
        productId: product._id.toString(),
        productName: product.name,
        handled,
        outOfStockHandledAt: product.outOfStockHandledAt?.toISOString(),
      },
      handled
        ? `${product.name} marqué comme traité`
        : `${product.name} marqué comme non-traité`
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
