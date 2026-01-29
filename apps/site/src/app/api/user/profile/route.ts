import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "../../../../lib/mongodb";
import { User } from "@coworking-cafe/database";
import { options } from "../../../../lib/auth-options";
import type {
  GetUserProfileResponse,
  UpdateUserProfileResponse,
  ProfileErrorResponse,
  UserProfileUpdatePayload,
  UserProfileUpdateData,
} from "../../../../types/user";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
): Promise<NextResponse<GetUserProfileResponse | ProfileErrorResponse>> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json<ProfileErrorResponse>(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email }).select(
      "email username givenName phone companyName newsletter emailVerifiedAt createdAt",
    );

    if (!user) {
      return NextResponse.json<ProfileErrorResponse>(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json<GetUserProfileResponse>(
      {
        user: {
          email: user.email || "",
          username: user.username || "",
          givenName: user.givenName || "",
          phone: user.phone,
          companyName: user.companyName,
          newsletter: user.newsletter,
          emailVerifiedAt: user.emailVerifiedAt,
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json<ProfileErrorResponse>(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération du profil",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
): Promise<NextResponse<UpdateUserProfileResponse | ProfileErrorResponse>> {
  try {
    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json<ProfileErrorResponse>(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    await dbConnect();

    const body: UserProfileUpdatePayload = await request.json();
    const { name, email, phone, companyName } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json<ProfileErrorResponse>(
        { error: "Le nom et l'email sont requis" },
        { status: 400 },
      );
    }

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json<ProfileErrorResponse>(
          { error: "Cet email est déjà utilisé" },
          { status: 400 },
        );
      }
    }

    // Prepare update object with explicit typing
    const updateData: UserProfileUpdateData = {
      givenName: name,
      email: email,
    };

    // Add phone if provided
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // Add companyName if provided
    if (companyName !== undefined) {
      updateData.companyName = companyName;
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, select: "email username givenName phone companyName" },
    );

    if (!updatedUser) {
      return NextResponse.json<ProfileErrorResponse>(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    return NextResponse.json<UpdateUserProfileResponse>(
      {
        message: "Profil mis à jour avec succès",
        user: {
          email: updatedUser.email || "",
          username: updatedUser.username || "",
          name: updatedUser.givenName || "",
          phone: updatedUser.phone,
          companyName: updatedUser.companyName,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json<ProfileErrorResponse>(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour du profil",
      },
      { status: 500 },
    );
  }
}
