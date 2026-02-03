import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { User, Newsletter } from "@coworking-cafe/database";
import type { ApiResponse } from "@/types/timeEntry";
import type { User as UserType, UserUpdateData, PopulatedUserDocument } from "@/types/user";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/users/[id]
 * Récupère un utilisateur par son ID
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<UserType>>> {
  // Auth dev/admin/staff
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<UserType>>;
  }

  await connectMongoose();

  try {
    const { id } = params;

    const user = (await User.findById(id).populate("role").lean()) as unknown as PopulatedUserDocument | null;

    if (!user) {
      return errorResponse("Utilisateur non trouvé", `Aucun utilisateur avec l'ID ${id}`, 404);
    }

    // Transform to UserType
    const transformedUser: UserType = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      givenName: user.givenName,
      phone: user.phone,
      companyName: user.companyName,
      role: {
        id: user.role._id.toString(),
        slug: user.role.slug as "dev" | "admin" | "staff" | "client",
        name: user.role.name,
        level: user.role.level,
      },
      newsletter: user.newsletter,
      emailVerifiedAt: user.emailVerifiedAt
        ? new Date(user.emailVerifiedAt).toISOString().split("T")[0]
        : undefined,
      lastLoginAt: user.lastLoginAt
        ? new Date(user.lastLoginAt).toISOString().split("T")[0]
        : undefined,
      createdAt: new Date(user.createdAt).toISOString().split("T")[0],
      updatedAt: new Date(user.updatedAt).toISOString().split("T")[0],
      deletedAt: user.deletedAt
        ? new Date(user.deletedAt).toISOString().split("T")[0]
        : undefined,
      isActive: !user.deletedAt,
      isEmailVerified: !!user.emailVerifiedAt,
    };

    return successResponse(transformedUser, "Utilisateur récupéré avec succès");
  } catch (error) {
    console.error(`GET /api/users/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la récupération de l'utilisateur",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}

/**
 * PUT /api/users/[id]
 * Met à jour un utilisateur
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<UserType>>> {
  // Auth dev/admin only
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<UserType>>;
  }

  await connectMongoose();

  try {
    const { id } = params;
    const body: UserUpdateData = await request.json();

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return errorResponse("Utilisateur non trouvé", `Aucun utilisateur avec l'ID ${id}`, 404);
    }

    // Check email uniqueness if changing email
    if (body.email && body.email !== user.email) {
      const existingEmail = await User.findOne({ email: body.email });
      if (existingEmail) {
        return errorResponse("Email déjà utilisé", "Un utilisateur avec cet email existe déjà", 400);
      }
    }

    // Check username uniqueness if changing username
    if (body.username && body.username !== user.username) {
      const existingUsername = await User.findOne({ username: body.username });
      if (existingUsername) {
        return errorResponse(
          "Username déjà utilisé",
          "Un utilisateur avec ce nom d'utilisateur existe déjà",
          400
        );
      }
    }

    // Update user
    const updatedUser = (await User.findByIdAndUpdate(
      id,
      {
        ...(body.email && { email: body.email }),
        ...(body.username !== undefined && { username: body.username }),
        ...(body.givenName !== undefined && { givenName: body.givenName }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.roleId && { role: body.roleId }),
        ...(body.newsletter !== undefined && { newsletter: body.newsletter }),
      },
      { new: true, runValidators: true }
    ).populate("role")) as unknown as PopulatedUserDocument | null;

    if (!updatedUser) {
      return errorResponse("Erreur de mise à jour", "Impossible de mettre à jour l'utilisateur", 500);
    }

    // Transform to UserType
    const transformedUser: UserType = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      username: updatedUser.username,
      givenName: updatedUser.givenName,
      phone: updatedUser.phone,
      companyName: updatedUser.companyName,
      role: {
        id: updatedUser.role._id.toString(),
        slug: updatedUser.role.slug as "dev" | "admin" | "staff" | "client",
        name: updatedUser.role.name,
        level: updatedUser.role.level,
      },
      newsletter: updatedUser.newsletter,
      emailVerifiedAt: updatedUser.emailVerifiedAt
        ? new Date(updatedUser.emailVerifiedAt).toISOString().split("T")[0]
        : undefined,
      lastLoginAt: updatedUser.lastLoginAt
        ? new Date(updatedUser.lastLoginAt).toISOString().split("T")[0]
        : undefined,
      createdAt: new Date(updatedUser.createdAt).toISOString().split("T")[0],
      updatedAt: new Date(updatedUser.updatedAt).toISOString().split("T")[0],
      deletedAt: updatedUser.deletedAt
        ? new Date(updatedUser.deletedAt).toISOString().split("T")[0]
        : undefined,
      isActive: !updatedUser.deletedAt,
      isEmailVerified: !!updatedUser.emailVerifiedAt,
    };

    return successResponse(transformedUser, "Utilisateur mis à jour avec succès");
  } catch (error) {
    console.error(`PUT /api/users/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la mise à jour de l'utilisateur",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Supprime un utilisateur (soft delete) ou un abonné newsletter
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  // Auth dev/admin only
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<null>>;
  }

  await connectMongoose();

  try {
    const { id } = params;

    // Try to find in users collection first
    const user = await User.findById(id);

    if (user) {
      // Soft delete user
      await User.findByIdAndUpdate(id, { deletedAt: new Date() });
      return successResponse(null, "Utilisateur supprimé avec succès");
    }

    // If not found in users, try newsletters collection
    const newsletter = await Newsletter.findById(id);

    if (newsletter) {
      // Unsubscribe newsletter
      await Newsletter.findByIdAndUpdate(id, { isSubscribed: false });
      return successResponse(null, "Abonné newsletter supprimé avec succès");
    }

    // Not found in either collection
    return errorResponse("Utilisateur non trouvé", `Aucun utilisateur avec l'ID ${id}`, 404);
  } catch (error) {
    console.error(`DELETE /api/users/${params.id} error:`, error);
    return errorResponse(
      "Erreur lors de la suppression de l'utilisateur",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}
