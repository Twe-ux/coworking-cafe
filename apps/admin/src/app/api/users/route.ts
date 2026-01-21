import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/response";
import { connectMongoose } from "@/lib/mongodb";
import { User, Newsletter } from "@coworking-cafe/database";
import type { ApiResponse } from "@/types/timeEntry";
import type { User as UserType, UserFilters, PopulatedUserDocument } from "@/types/user";

/**
 * GET /api/users
 * Récupère la liste des utilisateurs + newsletter subscribers
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

    // Fetch all users with roles
    // Filter out users with invalid role field (string instead of ObjectId)
    const rawUsers = await User.find().sort({ createdAt: -1 }).lean();

    const users: PopulatedUserDocument[] = [];

    for (const user of rawUsers) {
      try {
        // Try to populate role
        const populatedUser = await User.findById(user._id).populate("role").lean();
        if (populatedUser && populatedUser.role) {
          users.push(populatedUser as unknown as PopulatedUserDocument);
        } else {
          console.warn(`[API /users] User ${user._id} has invalid or missing role, skipping`);
        }
      } catch (error) {
        console.warn(`[API /users] Failed to populate role for user ${user._id}:`, error);
        // Skip users with invalid role field
      }
    }

    // Fetch all newsletter entries (for standalone emails)
    const newsletters = await Newsletter.find({ isSubscribed: true }).lean();

    // Create a map to combine users + newsletters
    const usersMap = new Map<string, UserType>();

    // Add all users
    users.forEach((user) => {
      // Skip users without valid role (should not happen but safety check)
      if (!user.role || !user.role._id) {
        console.warn(`[API /users] User ${user._id} has no valid role, skipping`);
        return;
      }

      const emailLower = user.email.toLowerCase();
      usersMap.set(emailLower, {
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
      });
    });

    // Add standalone newsletter entries (emails without account)
    newsletters.forEach((newsletter) => {
      const emailLower = newsletter.email.toLowerCase();

      // Only add if not already in users (user account takes priority)
      if (!usersMap.has(emailLower)) {
        usersMap.set(emailLower, {
          id: newsletter._id.toString(),
          email: newsletter.email,
          username: undefined,
          givenName: undefined,
          phone: undefined,
          companyName: undefined,
          role: {
            id: "newsletter-only",
            slug: "newsletter-only",
            name: "Newsletter uniquement",
            level: 0,
          },
          newsletter: true,
          emailVerifiedAt: undefined,
          lastLoginAt: undefined,
          createdAt: new Date(newsletter.createdAt).toISOString().split("T")[0],
          updatedAt: new Date(newsletter.updatedAt).toISOString().split("T")[0],
          deletedAt: undefined,
          isActive: true,
          isEmailVerified: false,
        });
      }
    });

    // Convert map to array
    let allUsers = Array.from(usersMap.values());

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter((u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.username?.toLowerCase().includes(searchLower) ||
        u.givenName?.toLowerCase().includes(searchLower)
      );
    }

    if (roleSlug && roleSlug !== "all") {
      allUsers = allUsers.filter((u) => u.role.slug === roleSlug);
    }

    if (isActiveParam === "true") {
      allUsers = allUsers.filter((u) => u.isActive);
    } else if (isActiveParam === "false") {
      allUsers = allUsers.filter((u) => !u.isActive);
    }

    if (newsletterParam === "true") {
      allUsers = allUsers.filter((u) => u.newsletter);
    } else if (newsletterParam === "false") {
      allUsers = allUsers.filter((u) => !u.newsletter);
    }

    return successResponse(
      allUsers,
      `${allUsers.length} utilisateurs récupérés`
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

    // Cast to PopulatedUserDocument for type safety
    const populatedUser = newUser.toObject() as unknown as PopulatedUserDocument;

    // Transform to UserType
    const transformedUser: UserType = {
      id: populatedUser._id.toString(),
      email: populatedUser.email,
      username: populatedUser.username,
      givenName: populatedUser.givenName,
      phone: populatedUser.phone,
      companyName: populatedUser.companyName,
      role: {
        id: populatedUser.role._id.toString(),
        slug: populatedUser.role.slug as "dev" | "admin" | "staff" | "client",
        name: populatedUser.role.name,
        level: populatedUser.role.level,
      },
      newsletter: populatedUser.newsletter,
      emailVerifiedAt: populatedUser.emailVerifiedAt
        ? new Date(populatedUser.emailVerifiedAt).toISOString().split("T")[0]
        : undefined,
      lastLoginAt: populatedUser.lastLoginAt
        ? new Date(populatedUser.lastLoginAt).toISOString().split("T")[0]
        : undefined,
      createdAt: new Date(populatedUser.createdAt).toISOString().split("T")[0],
      updatedAt: new Date(populatedUser.updatedAt).toISOString().split("T")[0],
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
