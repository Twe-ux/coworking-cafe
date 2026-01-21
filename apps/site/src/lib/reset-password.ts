/**
 * Script to reset a user's password
 * Run with: npx tsx src/lib/reset-password.ts
 */

// Load environment variables from .env.local
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

import connectDB from "./mongodb";
import { User } from "@coworking-cafe/database";

async function resetPassword() {
  const email = "client@coworkingcafe.fr";
  const newPassword = "client123456";

  try {
    await connectDB();
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      process.exit(1);
    }
    // Set plain password - the pre-save hook will hash it automatically    user.password = newPassword;
    await user.save();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

resetPassword();
