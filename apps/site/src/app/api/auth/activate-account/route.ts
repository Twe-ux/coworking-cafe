import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@coworking-cafe/database";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/activate-account - Activate user account with token
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Parse body
    const body = await request.json();

    // Validation
    if (!body.token || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: token and password are required",
        },
        { status: 400 },
      );
    }

    // Password validation
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        },
        { status: 400 },
      );
    }

    // Find user by activation token
    const user = await User.findOne({
      activationToken: body.token,
      activationTokenExpires: { $gt: new Date() }, // Token non expiré
    }).select("+activationToken +activationTokenExpires +password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "The activation link is invalid or has expired",
        },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Update user: set password, activate account, remove token
    user.password = hashedPassword;
    user.isTemporary = false;
    user.emailVerifiedAt = new Date();
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    console.log("✅ Account activated for user:", user.email);

    return NextResponse.json({
      success: true,
      message: "Account activated successfully",
      data: {
        email: user.email,
        activated: true,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/activate-account error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to activate account",
      },
      { status: 500 },
    );
  }
}
