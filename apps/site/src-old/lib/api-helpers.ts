import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "./auth-options";

/**
 * Custom error class for API authentication/authorization errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Helper to get authenticated user from session
 */
export async function getAuthUser() {
  const session = await getServerSession(options);

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    username: session.user.username,
  };
}

/**
 * Helper to check if user is authenticated and has required role
 * Throws ApiError if not authorized
 */
export async function requireAuth(
  allowedRoles: string[] = ["admin", "staff", "dev"],
) {
  const user = await getAuthUser();

  if (!user) {
    throw new ApiError("Authentication required", 401);
  }

  if (!allowedRoles.includes(user.role?.slug || "")) {
    throw new ApiError("Insufficient permissions", 403);
  }

  return user;
}

/**
 * Helper to handle API errors
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, ...error.data },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 },
  );
}

/**
 * Helper to generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .trim();
}

/**
 * Helper to calculate reading time (words per minute)
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute = 200,
): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}
