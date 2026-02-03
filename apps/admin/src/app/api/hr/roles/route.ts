import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { Role } from "@coworking-cafe/database";
import type { ApiResponse } from "@/types/produits";

/**
 * GET /api/hr/roles
 * Récupère tous les rôles système
 * Accessible à : dev, admin, staff
 */
export const dynamic = 'force-dynamic';
export async function GET(): Promise<NextResponse<ApiResponse<any[]>>> {
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response;
  }

  await connectMongoose();

  try {
    const roles = await Role.find().lean();

    const formattedRoles = roles.map((role) => ({
      id: role._id.toString(),
      name: role.name,
      slug: role.slug,
      description: role.description,
      level: role.level,
      isSystem: role.isSystem,
    }));

    return successResponse(formattedRoles, "Rôles récupérés avec succès");
  } catch (error) {
    console.error("GET /api/hr/roles error:", error);
    return errorResponse(
      "Erreur lors de la récupération des rôles",
      (error as Error).message
    );
  }
}
