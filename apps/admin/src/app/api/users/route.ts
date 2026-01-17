import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { User } from "@coworking-cafe/database";
import type { ApiResponse } from "@/types/timeEntry";
import type { User as UserType, UserFilters } from "@/types/user";

/**
 * GET /api/users
 * Récupère la liste des utilisateurs avec filtres optionnels
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserType[]>>> {
  // Auth dev/admin/staff
  const authResult = await requireAuth(["dev", "admin", "staff"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<UserType[]>>;
  }

  await connectMongoose();

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const roleSlug = searchParams.get("roleSlug");
    const isActiveParam = searchParams.get("isActive");
    const newsletterParam = searchParams.get("newsletter");

    // Build filter
    const filter: Record<string, unknown> = {};

    // Search filter (email, username, givenName)
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { givenName: { $regex: search, $options: "i" } },
      ];
    }

    // Active filter
    if (isActiveParam === "true") {
      filter.deletedAt = null;
    } else if (isActiveParam === "false") {
      filter.deletedAt = { $ne: null };
    }

    // Newsletter filter
    if (newsletterParam === "true") {
      filter.newsletter = true;
    } else if (newsletterParam === "false") {
      filter.newsletter = false;
    }

    // Fetch users with populated role
    const users = await User.find(filter)
      .populate("role")
      .sort({ createdAt: -1 })
      .lean();

    // Transform to match UserType (convert dates to strings)
    const transformedUsers: UserType[] = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      givenName: user.givenName,
      phone: user.phone,
      companyName: user.companyName,
      role: {
        id: user.role._id.toString(),
        slug: user.role.slug,
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
    }));

    // Filter by role slug if provided (after population)
    let finalUsers = transformedUsers;
    if (roleSlug && roleSlug !== "all") {
      finalUsers = transformedUsers.filter((u) => u.role.slug === roleSlug);
    }

    return successResponse(
      finalUsers,
      `${finalUsers.length} utilisateurs récupérés`
    );
  } catch (error) {
    console.error("GET /api/users error:", error);
    return errorResponse(
      "Erreur lors de la récupération des utilisateurs",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}

/**
 * POST /api/users
 * Crée un nouvel utilisateur
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserType>>> {
  // Auth dev/admin only
  const authResult = await requireAuth(["dev", "admin"]);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ApiResponse<UserType>>;
  }

  await connectMongoose();

  try {
    const body = await request.json();
    const { email, username, givenName, phone, companyName, roleId, newsletter, password } = body;

    // Validation
    if (!email || !roleId || !password) {
      return errorResponse(
        "Données manquantes",
        "email, roleId et password sont requis",
        400
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse("Email déjà utilisé", "Un utilisateur avec cet email existe déjà", 400);
    }

    // Check if username already exists
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return errorResponse(
          "Username déjà utilisé",
          "Un utilisateur avec ce nom d'utilisateur existe déjà",
          400
        );
      }
    }

    // Create user
    const newUser = await User.create({
      email,
      username,
      givenName,
      phone,
      companyName,
      role: roleId,
      newsletter: newsletter || false,
      password, // Will be hashed by pre-save hook
    });

    // Populate role
    await newUser.populate("role");

    // Transform to UserType
    const transformedUser: UserType = {
      id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      givenName: newUser.givenName,
      phone: newUser.phone,
      companyName: newUser.companyName,
      role: {
        id: newUser.role._id.toString(),
        slug: newUser.role.slug,
        name: newUser.role.name,
        level: newUser.role.level,
      },
      newsletter: newUser.newsletter,
      emailVerifiedAt: newUser.emailVerifiedAt
        ? new Date(newUser.emailVerifiedAt).toISOString().split("T")[0]
        : undefined,
      lastLoginAt: newUser.lastLoginAt
        ? new Date(newUser.lastLoginAt).toISOString().split("T")[0]
        : undefined,
      createdAt: new Date(newUser.createdAt).toISOString().split("T")[0],
      updatedAt: new Date(newUser.updatedAt).toISOString().split("T")[0],
      deletedAt: undefined,
      isActive: true,
      isEmailVerified: false,
    };

    return successResponse(transformedUser, "Utilisateur créé avec succès", 201);
  } catch (error) {
    console.error("POST /api/users error:", error);
    return errorResponse(
      "Erreur lors de la création de l'utilisateur",
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
}
